import { CircleDollarSign } from 'lucide-react'
import { formatPrice } from '../../utils/index'

export default function PriceSection({ variant, language, t }) {
  if (!variant) {
    return (
      <div className="sidebar-car px-6 py-5 text-[#1b1b1b]">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CircleDollarSign className="h-4 w-4" />
          <span>{t('productDetails.priceSuffix')}</span>
        </div>
        <h4 className="mt-2 text-3xl font-bold leading-tight">--</h4>
      </div>
    )
  }

  return (
    <div className="sidebar-car px-6 py-5 text-[#1b1b1b]">
      <div className="flex items-center gap-2 text-sm font-medium">
        <CircleDollarSign className="h-4 w-4" />
        <span>{t('productDetails.priceSuffix')}</span>
      </div>
      <h4 className="mt-2 text-3xl font-bold leading-tight">
        {formatPrice(variant.price, language)}
      </h4>
      {variant.unit && (
        <p className="mt-1 text-xs font-medium opacity-80">
          {t('productDetails.unit')}: {variant.unit}
        </p>
      )}
    </div>
  )
}
