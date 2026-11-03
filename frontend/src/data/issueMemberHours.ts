/**
 * 过去各期里每个成员当时的本周工时（小时），按期号、成员账号；第 32 期（今天）用成员自己的数据。
 * 接口接通后对应 GET /projects/{projectId}/issues/{issueDate} 里的成员工时
 */
export const issueMemberHours: Record<number, Record<string, number>> = {
  31: { pm_a: 35, dev_a: 29, dev_b: 24, qa_c: 18 },
  30: { pm_a: 24, dev_a: 20, dev_b: 17, qa_c: 13 },
  29: { pm_a: 9, dev_a: 8, dev_b: 7, qa_c: 5 },
  28: { pm_a: 44, dev_a: 38, dev_b: 33, qa_c: 26 },
  27: { pm_a: 43, dev_a: 37, dev_b: 32, qa_c: 25 },
  26: { pm_a: 41, dev_a: 36, dev_b: 32, qa_c: 25 },
  25: { pm_a: 29, dev_a: 26, dev_b: 24, qa_c: 19 },
  24: { pm_a: 21, dev_a: 18, dev_b: 17, qa_c: 13 },
  23: { pm_a: 13, dev_a: 10, dev_b: 9, qa_c: 7 },
};
