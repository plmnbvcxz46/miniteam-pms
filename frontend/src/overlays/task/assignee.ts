import type { AssigneeCandidate } from "../../shared/types/task";

/** 浮层里最多直接显示的技能标签个数，其余折成 +N */
export const MAX_VISIBLE_TAGS = 3;

export interface RankedCandidate {
  candidate: AssigneeCandidate;
  /** 命中的普通词和 + 词的个数 */
  score: number;
  /** 搜索时不满足条件的人：不隐藏，排在后面并弱化 */
  miss: boolean;
  /** 被命中的技能标签 */
  hitTags: Set<string>;
  /** 命中姓名的词，用来在姓名里标出来 */
  nameHits: string[];
}

export interface RankResult {
  searching: boolean;
  rows: RankedCandidate[];
}

const normalize = (text: string) => text.normalize("NFKC").toLowerCase();

export function isOverloaded(candidate: AssigneeCandidate): boolean {
  return candidate.load > candidate.capacity;
}

/** 负载条填充比例，0 到 1 */
export function loadRatio(candidate: AssigneeCandidate): number {
  if (candidate.capacity <= 0) return candidate.load > 0 ? 1 : 0;
  return Math.min(candidate.load / candidate.capacity, 1);
}

/**
 * 按关键词给候选人排序，写法和老式搜索一致：
 * - +词：必须包含（姓名或任一技能标签里有）
 * - -词：必须不含
 * - 普通词：含其中任一个即可，命中越多越靠前
 * 没有输入时只按负载比例排，同分按负载、再按 id
 */
export function rankAssignees(
  candidates: AssigneeCandidate[],
  query: string,
): RankResult {
  const must: string[] = [];
  const not: string[] = [];
  const any: string[] = [];
  const words = new Set(
    normalize(query)
      .trim()
      .split(/[\s,，、;；/]+/)
      .filter(Boolean),
  );
  words.forEach((word) => {
    const rest = word.slice(1);
    if (word.startsWith("+")) {
      if (rest) must.push(rest);
    } else if (word.startsWith("-")) {
      if (rest) not.push(rest);
    } else {
      any.push(word);
    }
  });
  const positive = [...must, ...any];
  const searching = positive.length + not.length > 0;

  const rows = candidates.map((candidate): RankedCandidate => {
    const name = normalize(candidate.user.realName);
    const has = (word: string) =>
      name.includes(word) ||
      candidate.skillTags.some((tag) => normalize(tag).includes(word));
    const ok = must.every(has) && !not.some(has);
    const score = positive.filter(has).length;
    return {
      candidate,
      score,
      miss: searching && (!ok || (positive.length > 0 && score === 0)),
      hitTags: new Set(
        candidate.skillTags.filter((tag) =>
          positive.some((word) => normalize(tag).includes(word)),
        ),
      ),
      nameHits: positive.filter((word) => name.includes(word)),
    };
  });

  const ratio = (c: AssigneeCandidate) =>
    c.capacity > 0 ? c.load / c.capacity : Infinity;
  rows.sort(
    (a, b) =>
      Number(a.miss) - Number(b.miss) ||
      b.score - a.score ||
      ratio(a.candidate) - ratio(b.candidate) ||
      a.candidate.load - b.candidate.load ||
      a.candidate.user.id - b.candidate.user.id,
  );
  return { searching, rows };
}

/** 排第一、没被弱化、有命中的那个人才是推荐 */
export function getRecommendedId(result: RankResult): number | null {
  const first = result.rows[0];
  if (!result.searching || !first || first.miss || first.score === 0) return null;
  return first.candidate.user.id;
}

/** 技能标签最多显示 MAX_VISIBLE_TAGS 个，命中的排前面，返回显示的和被折起的个数 */
export function pickVisibleTags(
  tags: string[],
  hitTags: Set<string>,
): { shown: string[]; hidden: number } {
  const ordered = [
    ...tags.filter((tag) => hitTags.has(tag)),
    ...tags.filter((tag) => !hitTags.has(tag)),
  ];
  const shown = ordered.slice(0, MAX_VISIBLE_TAGS);
  return { shown, hidden: tags.length - shown.length };
}

/** 把姓名按命中的词切成片段，命中的片段会加下划线 */
export function splitNameByHits(
  name: string,
  hits: string[],
): { text: string; hit: boolean }[] {
  if (hits.length === 0) return [{ text: name, hit: false }];
  const chars = Array.from(name);
  const lowered = Array.from(normalize(name));
  const marked = chars.map(() => false);
  // 归一化可能改变字符数（全角转半角不会，但保险起见长度不一致时不标）
  if (lowered.length === chars.length) {
    for (const hit of hits) {
      const target = Array.from(hit);
      for (let i = 0; i + target.length <= lowered.length; i += 1) {
        if (target.every((ch, k) => lowered[i + k] === ch)) {
          for (let k = 0; k < target.length; k += 1) marked[i + k] = true;
        }
      }
    }
  }
  const parts: { text: string; hit: boolean }[] = [];
  chars.forEach((ch, i) => {
    const last = parts[parts.length - 1];
    if (last && last.hit === marked[i]) last.text += ch;
    else parts.push({ text: ch, hit: marked[i] });
  });
  return parts;
}
