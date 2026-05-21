import { CheckCircle2 } from 'lucide-react'

export default function SpecsSection({ specs, source, t }) {
  const title =
    source === 'variant'
      ? t('productDetails.specifications')
      : t('productDetails.summary')

  if (!specs || specs.length === 0) {
    return (
      <div>
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
          <CheckCircle2 className="h-4 w-4 text-[#f5b754]" />
          {title}
        </p>
        <div className="rounded-2xl border border-dashed border-white/20 px-4 py-5 text-sm text-slate-400">
          {t('productDetails.noSpecs')}
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <CheckCircle2 className="h-4 w-4 text-[#f5b754]" />
        {title}
      </p>
      <div className="space-y-3">
        {specs.map((item) => (
          <div
            key={item.key}
            className="grid grid-cols-2 gap-3 border-b border-white/10 pb-3 text-sm last:border-b-0 last:pb-0"
          >
            <div className="flex items-center gap-2 text-slate-400">
              {item.iconSvg && (
                <span
                  className="inline-flex h-5 w-5 items-center justify-center text-[#f5b754]"
                  dangerouslySetInnerHTML={{ __html: item.iconSvg }}
                />
              )}
              <span>{item.label}</span>
            </div>
            <p className="text-right font-medium text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
