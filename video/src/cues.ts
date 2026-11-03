// Scene moments (scene frames) shared by the picture and the sound effects.
import { CLIPS, clipToScene, LINES, markAt, SCENES, sceneIndex, sfx, SFX, START, wordAt } from "./timeline";

export const CUE = {
  title: { spark: 6, riser: 10, titleIn: 40 },
  moon: { through: 38, heroIn: 45, panel: 62, panelOut: 128 },
  hero: { zoomIn: 4, icon1: wordAt("hero", "combustion"), icon2: wordAt("hero", "reports"), gather: 214, zoomOut: 196 },
  rank: {
    card: 6,
    cut: 87,
    select: markAt("rank", "rank", "select"),
    drag: markAt("rank", "rank", "dragStart"),
    dragEnd: markAt("rank", "rank", "dragEnd"),
    live: markAt("rank", "rank", "dragStart") + 20,
    why: wordAt("rank", "answers"),
  },
  detail: { open: markAt("detail", "detail", "drawer"), plain: markAt("detail", "detail", "drawer") + 14, cut: 132, side: 150 },
  network: {
    zoom: 6,
    hover1: markAt("network", "network", "hover1"),
    hover2: markAt("network", "network", "hover2"),
    connect: wordAt("network", "all"),
  },
  ask: {
    zoom: 10,
    asked: clipToScene("ask", CLIPS.ask.clicks[1].t)!,
    answer: markAt("ask", "ask", "answer"),
    source: markAt("ask", "ask", "answer") + 12,
    jump: markAt("ask", "ask", "jumped"),
  },
  gaps: { pan: markAt("gaps", "gaps", "panStart"), box: markAt("gaps", "gaps", "moonCard") - 4, missing: markAt("gaps", "gaps", "moonCard") + 10 },
  end: {
    name: wordAt("end", "osama"),
    title: wordAt("end", "this"),
    logo: wordAt("end", "nasa"),
    link: SCENES[sceneIndex("end")].voiceAt + Math.round(LINES[8].words.at(-1)!.end * 30) + 4,
  },
};

const at = (id: string, f: number) => START[sceneIndex(id)] + f;
sfx("spark", at("title", CUE.title.spark));
sfx("riser", at("title", CUE.title.riser));
sfx("boom", at("title", CUE.title.titleIn));
sfx("whoosh", at("moon", CUE.moon.through));
sfx("pop", at("moon", CUE.moon.panel));
sfx("pop", at("moon", CUE.moon.panel + 6));
sfx("pop", at("hero", CUE.hero.icon1));
sfx("pop", at("hero", CUE.hero.icon2));
sfx("pop", at("rank", CUE.rank.card + 8));
sfx("whoosh", at("rank", CUE.rank.cut - 2));
sfx("shimmer", at("rank", CUE.rank.drag + 10));
sfx("pop", at("rank", CUE.rank.live));
sfx("pop", at("rank", CUE.rank.why));
sfx("pop", at("detail", CUE.detail.plain));
sfx("pop", at("detail", CUE.detail.side));
sfx("pop", at("network", CUE.network.connect));
sfx("pop", at("ask", CUE.ask.source));
sfx("pop", at("gaps", CUE.gaps.missing));
sfx("pop", at("end", CUE.end.name));
sfx("pop", at("end", CUE.end.title));
sfx("pop", at("end", CUE.end.logo));
sfx("pop", at("end", CUE.end.link));
sfx("boom", at("end", CUE.end.link + 2));

export const ALL_SFX = SFX;
