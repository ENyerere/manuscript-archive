/**
 * 技能数据:语言与方向分离。
 * - 语言:构建期由 virtual:github-languages 按 GitHub 代码量自动聚合;
 *   fallbackLanguages 仅在 API 不可用时兜底展示
 * - 方向(disciplines):语言之外的能力维度,人工策展
 */
export const fallbackLanguages: string[] = ['TypeScript', 'Python', 'Vue', 'C/C++', 'Java', 'PHP']

export const disciplines: string[] = ['软件开发']
