import { pool } from "@/lib/db";

export async function createQuestion(
  examId: number,
  quesStatement: string,
  options: string,
  correctAns: string,
  marks: number = 1,
) {
  const res = await pool.query(
    `INSERT INTO question(exam_id, ques_statement, options, correct_ans, marks)
     VALUES($1, $2, $3, $4, $5) RETURNING *`,
    [examId, quesStatement, options, correctAns, marks],
  );
  return res.rows[0];
}

export async function getQuestions(examId: number) {
  const res = await pool.query(
    `SELECT * FROM question WHERE exam_id=$1 ORDER BY ques_id`,
    [examId],
  );
  return res.rows;
}

export async function updateQuestion(
  quesId: number,
  quesStatement: string,
  options: string,
  correctAns: string,
  marks?: number,
) {
  let query = `UPDATE question SET ques_statement=$1, options=$2, correct_ans=$3`;
  const params: any[] = [quesStatement, options, correctAns];
  
  if (marks !== undefined) {
    params.push(marks);
    query += `, marks=$${params.length}`;
  }

  params.push(quesId);
  query += ` WHERE ques_id=$${params.length} RETURNING *`;
  
  const res = await pool.query(query, params);
  return res.rows[0];
}

export async function deleteQuestion(quesId: number) {
  const res = await pool.query(
    `DELETE FROM question WHERE ques_id=$1 RETURNING *`,
    [quesId],
  );
  return res.rows[0];
}
