import { profile } from '@/data/profile'
import { fallbackLanguages, disciplines } from '@/data/skills'
import projects from 'virtual:github-projects'
import languages from 'virtual:github-languages'
import { socials } from '@/data/socials'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/**
 * 关于页:单栏阅读宽度,hairline 分节,无卡片。
 * 节标题用等宽小标签,内容用正文系统。
 */
export default function AboutPage() {
  useDocumentTitle('关于')
  return (
    <div className="py-10 md:py-16 max-w-[42rem]">
      {/* 个人档案 */}
      <header className="mb-12">
        <img
          src={profile.avatar.src}
          srcSet={profile.avatar.srcSet}
          width={64}
          height={64}
          alt={profile.name}
          className="w-16 h-16 rounded-sm object-cover mb-6"
        />
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{profile.name}</h1>
        <p className="font-mono text-sm text-muted-foreground mb-6">{profile.role}</p>
        <p className="leading-8 text-foreground/90">{profile.about}</p>
      </header>

      {/* 技能:语言(GitHub 代码量自动聚合)+ 方向(人工策展) */}
      <section className="border-t border-border pt-8 mt-8">
        <h2 className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase mb-4">
          技能 / Skills
        </h2>

        <div className="mb-6">
          <p className="font-mono text-xs text-muted-foreground tracking-[0.08em] mb-3">
            语言 · 按 GitHub 代码量
          </p>
          {languages.length > 0 ? (
            <>
              {/* 单色分段比例细线:明度随占比递减 */}
              <div className="flex h-[2px] w-full max-w-md gap-px mb-3" aria-hidden="true">
                {languages.map((lang, i) => (
                  <div
                    key={lang.name}
                    className="bg-foreground"
                    style={{ width: `${lang.percent}%`, opacity: Math.max(1 - i * 0.18, 0.2) }}
                  />
                ))}
              </div>
              <p className="font-mono text-sm leading-8">
                {languages.map((lang, i) => (
                  <span key={lang.name}>
                    {i > 0 && ' · '}
                    {lang.name} {lang.percent}%
                  </span>
                ))}
              </p>
            </>
          ) : (
            // GitHub 数据不可用时的兜底清单
            <p className="font-mono text-sm leading-8">{fallbackLanguages.join(' · ')}</p>
          )}
        </div>

        <div>
          <p className="font-mono text-xs text-muted-foreground tracking-[0.08em] mb-3">方向</p>
          <p className="font-mono text-sm leading-8">{disciplines.join(' · ')}</p>
        </div>
      </section>

      {/* 项目:构建期注入的 GitHub 策展数据(src/data/projects.ts 维护名单) */}
      <section className="border-t border-border pt-8 mt-8">
        <h2 className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase mb-2">
          项目 / Projects
        </h2>
        <div className="divide-y divide-border/60">
          {projects.map((project) => (
            <div key={project.repo} className="py-5">
              <h3 className="text-lg font-semibold mb-1.5">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline underline-offset-4"
                >
                  {project.title}
                </a>
              </h3>
              <p className="text-muted-foreground leading-7 mb-3">{project.description}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {[
                  project.language,
                  project.stars > 0 ? `★ ${project.stars}` : null,
                  project.pushedAt ? `更新于 ${project.pushedAt.slice(0, 7)}` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 联系 */}
      <section className="border-t border-border pt-8 mt-8">
        <h2 className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase mb-4">
          联系 / Contact
        </h2>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {socials.map((social) => {
            const isHttp = social.url.startsWith('http')
            return (
              <a
                key={social.label}
                href={social.url}
                target={isHttp ? '_blank' : undefined}
                rel={isHttp ? 'noopener noreferrer' : undefined}
                className="u-line text-foreground"
              >
                {social.label}
              </a>
            )
          })}
        </div>
      </section>
    </div>
  )
}
