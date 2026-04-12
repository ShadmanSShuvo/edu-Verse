import { pool } from "@/lib/db";
import { revalidateTag, revalidatePath } from "next/cache";

// ── Pending-payment helpers (for SSLCommerz initiation flow) ──────────────────

/**
 * Creates an order + a Pending payment record upfront when the user clicks
 * "Pay & Enroll".  The order and payment rows are written immediately so the
 * transaction ID is traceable even if the user abandons the gateway.
 * Enrollment is NOT done here — only on confirmed payment.
 *
 * Returns { orderId, paymentId }.
 */
export async function createPendingPayment(
  userId: number,
  courseIds: number[],
  amount: number,
  tranId: string
): Promise<{ orderId: number; paymentId: number }> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Create the order with detailed financial info
    const orderRes = await client.query(
      `INSERT INTO orders(user_id, course_id, amount, currency, status, ssl_tran_id, placed_at, updated_at) 
       VALUES($1, $2, $3, 'BDT', 'PENDING', $4, NOW(), NOW()) 
       RETURNING order_id`,
      [userId, courseIds.length === 1 ? courseIds[0] : null, amount, tranId]
    );
    const orderId: number = orderRes.rows[0].order_id;

    // 2. Link courses → order (course_order) — bulk INSERT for efficiency
    if (courseIds.length > 0) {
      const placeholders = courseIds.map((_, i) => `($1, $${i + 2})`).join(", ");
      await client.query(
        `INSERT INTO course_order(order_id, course_id) VALUES ${placeholders} ON CONFLICT DO NOTHING`,
        [orderId, ...courseIds]
      );
    }

    // 3. Create a Pending payment row
    const payRes = await client.query(
      `INSERT INTO payment(order_id, amount, status, method, time, transaction_id)
       VALUES($1, $2, 'Pending', 'SSLCommerz', NOW(), $3) RETURNING payment_id`,
      [orderId, amount, tranId]
    );
    const paymentId: number = payRes.rows[0].payment_id;

    await client.query("COMMIT");
    return { orderId, paymentId };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Retrieves a pending payment row along with its linked course IDs and user_id.
 * Used by success / IPN handlers to resume the transaction.
 */
export async function getPendingPaymentByTranId(tranId: string) {
  const res = await pool.query(
    `SELECT p.payment_id, p.order_id, p.amount, p.status,
            o.user_id,
            ARRAY_AGG(co.course_id) AS course_ids
     FROM payment p
     JOIN orders o ON p.order_id = o.order_id
     LEFT JOIN course_order co ON co.order_id = o.order_id
     WHERE p.transaction_id = $1
     GROUP BY p.payment_id, p.order_id, p.amount, p.status, o.user_id`,
    [tranId]
  );
  return res.rows[0] ?? null;
}

/**
 * Atomically marks the payment as Completed and enrolls the student.
 * Uses a single database transaction for consistency.
 */
export async function completePaymentAndEnroll(
  tranId: string,
  valId: string,
  bankTranId?: string,
  gatewayResponse?: any
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Lock only the payment record first (FOR UPDATE works here)
    const payRes = await client.query(
      `SELECT payment_id, order_id, status FROM payment 
       WHERE transaction_id = $1 FOR UPDATE`,
      [tranId]
    );

    if (payRes.rowCount === 0) {
      throw new Error(`No pending payment found for tran_id: ${tranId}`);
    }

    const { payment_id, order_id, status } = payRes.rows[0];

    // Idempotency check
    if (status === "Completed") {
      await client.query("COMMIT");
      return;
    }

    // 2. Fetch the user_id and linked course_ids for this order
    const orderRes = await client.query(
      `SELECT o.user_id, ARRAY_AGG(co.course_id) AS course_ids
       FROM orders o
       LEFT JOIN course_order co ON o.order_id = co.order_id
       WHERE o.order_id = $1
       GROUP BY o.user_id`,
      [order_id]
    );

    if (orderRes.rowCount === 0) {
      throw new Error(`Order ${order_id} not found`);
    }

    const { user_id, course_ids } = orderRes.rows[0];

    // 3. Ensure a student profile exists for this user
    let studentRes = await client.query(
      "SELECT student_id FROM student WHERE user_id = $1",
      [user_id]
    );
    
    let studentId;
    if (studentRes.rowCount === 0) {
      const newStudent = await client.query(
        "INSERT INTO student(user_id) VALUES($1) RETURNING student_id",
        [user_id]
      );
      studentId = newStudent.rows[0].student_id;
    } else {
      studentId = studentRes.rows[0].student_id;
    }

    // 4. Update payment status with full gateway info
    await client.query(
      `UPDATE payment
       SET status = 'Completed', 
           method = $1, 
           time = NOW(),
           ssl_val_id = $2,
           bank_tran_id = $3,
           gateway_response = $4
       WHERE payment_id = $5`,
      [`SSLCommerz|val_id:${valId}`, valId, bankTranId || null, gatewayResponse || null, payment_id]
    );

    // 5. Update order status
    await client.query(
      `UPDATE orders 
       SET status = 'COMPLETED', updated_at = NOW() 
       WHERE order_id = $1`,
      [order_id]
    );

    // 6. Atomic bulk enrollment for all courses in this order
    if (course_ids && course_ids.length > 0) {
      const validCourseIds = course_ids.filter(Boolean);
      if (validCourseIds.length > 0) {
        const placeholders = validCourseIds
          .map((_: number, i: number) => `($1, $${i + 2}, $${validCourseIds.length + 2})`)
          .join(", ");
        await client.query(
          `INSERT INTO enrollment(student_id, course_id, order_id)
           VALUES ${placeholders}
           ON CONFLICT DO NOTHING`,
          [studentId, ...validCourseIds, order_id]
        );
      }
    }

    await client.query("COMMIT");
    revalidateTag(`user-${user_id}-enrollments`, 'default');
    revalidateTag(`user-${user_id}-exams`, 'default');
    revalidateTag('enrollments', 'default');
    
    revalidatePath('/my-courses', 'page');
    revalidatePath('/modules', 'page');
    revalidatePath('/exams', 'page');
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[db/orders] Error in completePaymentAndEnroll:", err);
    throw err;
  } finally {
    client.release();
  }
}


/**
 * Updates a payment's status to Failed or Cancelled by tran_id.
 * Safe to call multiple times (idempotent if already in terminal state).
 */
/**
 * Updates an order with the session key returned from SSLCommerz initiation.
 */
export async function updateOrderSessionKey(
  tranId: string,
  sessionKey: string
): Promise<void> {
  await pool.query(
    `UPDATE orders SET ssl_session_key = $1, updated_at = NOW() 
     WHERE ssl_tran_id = $2`,
    [sessionKey, tranId]
  );
}


export async function updatePaymentStatusByTranId(
  tranId: string,
  status: "Failed" | "Cancelled"
): Promise<void> {
  await pool.query(
    `UPDATE payment SET status = $1
     WHERE transaction_id = $2 AND status = 'Pending'`,
    [status, tranId]
  );
}


export async function createOrder(userId: number) {
  const res = await pool.query(
    `INSERT INTO orders(user_id, placed_at)
     VALUES($1, NOW()) RETURNING *`,
    [userId],
  );
  return res.rows[0];
}

export async function getOrders(userId?: number) {
  if (userId) {
    const res = await pool.query(
      `SELECT o.*, u.name, u.email
       FROM orders o
       JOIN users u ON o.user_id=u.user_id
       WHERE o.user_id=$1
       ORDER BY o.placed_at DESC`,
      [userId],
    );
    return res.rows;
  }
  const res = await pool.query(`
    SELECT o.*, u.name, u.email
    FROM orders o
    JOIN users u ON o.user_id=u.user_id
    ORDER BY o.placed_at DESC
  `);
  return res.rows;
}

export async function createPayment(
  orderId: number,
  amount: number,
  status: string,
  method: string,
  transactionId: string,
) {
  const res = await pool.query(
    `INSERT INTO payment(order_id, amount, status, method, time, transaction_id)
     VALUES($1, $2, $3, $4, NOW(), $5) RETURNING *`,
    [orderId, amount, status, method, transactionId],
  );
  return res.rows[0];
}

export async function getPayments(orderId?: number) {
  if (orderId) {
    const res = await pool.query(
      `SELECT * FROM payment WHERE order_id=$1`,
      [orderId],
    );
    return res.rows;
  }
  const res = await pool.query(`SELECT * FROM payment ORDER BY time DESC`);
  return res.rows;
}

export async function updatePaymentStatus(paymentId: number, status: string) {
  const res = await pool.query(
    `UPDATE payment SET status=$1 WHERE payment_id=$2 RETURNING *`,
    [status, paymentId],
  );
  return res.rows[0];
}

// ── course_order junction ─────────────────────────────────────────────────────

/** Get all courses linked to an order. */
export async function getCoursesForOrder(orderId: number) {
  const res = await pool.query(
    `SELECT c.course_id, c.title, c.price
     FROM course_order co
     JOIN course c ON co.course_id = c.course_id
     WHERE co.order_id = $1`,
    [orderId]
  );
  return res.rows;
}

/**
 * Atomic order flow (Generates relationship):
 *  1. Creates an order
 *  2. Links courses via course_order
 *  3. Enrolls the student, recording enrollment.order_id
 *  Returns the created order row.
 */
export async function createOrderAndEnroll(
  userId: number,
  courseIds: number[]
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Create order
    const orderRes = await client.query(
      `INSERT INTO orders(user_id, placed_at) VALUES($1, NOW()) RETURNING *`,
      [userId]
    );
    const order = orderRes.rows[0];

    if (courseIds.length > 0) {
      // 2. Link courses to the order (Course_Order)
      const orderVals = courseIds.map((_, i) => `($1, $${i + 2})`).join(", ");
      await client.query(
        `INSERT INTO course_order(order_id, course_id) VALUES ${orderVals} ON CONFLICT DO NOTHING`,
        [order.order_id, ...courseIds]
      );

      // 3. Enroll student & stamp order_id (Generates)
      for (const courseId of courseIds) {
        await client.query(
          `INSERT INTO enrollment(student_id, course_id, order_id)
           SELECT s.student_id, $2, $3
           FROM student s WHERE s.user_id = $1
           ON CONFLICT DO NOTHING`,
          [userId, courseId, order.order_id]
        );
      }
    }

    await client.query("COMMIT");
    revalidateTag(`user-${userId}-enrollments`, 'default');
    revalidateTag(`user-${userId}-exams`, 'default');
    revalidateTag('enrollments', 'default');
    
    revalidatePath('/my-courses', 'page');
    revalidatePath('/modules', 'page');
    revalidatePath('/exams', 'page');
    
    return order;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Atomic Checkout (Transactions): Checklist Item 3
 * Inserts into orders -> payment -> course_order -> enrollment
 */
export async function createOrderWithPaymentAndEnroll(
  userId: number,
  courseIds: number[],
  paymentDetails: { amount: number; method: string; transaction_id: string }
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Create order
    const orderRes = await client.query(
      `INSERT INTO orders(user_id, placed_at) VALUES($1, NOW()) RETURNING *`,
      [userId]
    );
    const order = orderRes.rows[0];

    // 2. Create payment
    await client.query(
      `INSERT INTO payment(order_id, amount, status, method, time, transaction_id)
       VALUES($1, $2, 'Completed', $3, NOW(), $4)`,
      [order.order_id, paymentDetails.amount, paymentDetails.method, paymentDetails.transaction_id]
    );

    if (courseIds && courseIds.length > 0) {
      // 3. Link course_order
      for (const cId of courseIds) {
        await client.query(
          `INSERT INTO course_order(order_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [order.order_id, cId]
        );
      }

      // 4. Enroll student
      for (const courseId of courseIds) {
        await client.query(
          `INSERT INTO enrollment(student_id, course_id, order_id)
           SELECT s.student_id, $2, $3
           FROM student s WHERE s.user_id = $1
           ON CONFLICT DO NOTHING`,
          [userId, courseId, order.order_id]
        );
      }
    }

    await client.query("COMMIT");
    revalidateTag(`user-${userId}-enrollments`, 'default');
    revalidateTag(`user-${userId}-exams`, 'default');
    revalidateTag('enrollments', 'default');
    
    revalidatePath('/my-courses', 'page');
    revalidatePath('/modules', 'page');
    revalidatePath('/exams', 'page');
    
    return order;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
