import Link from 'next/link';
import SaveCityButton from '@/components/SaveCityButton';
import { unsplashCityUrl } from '@/lib/utils';

interface CityCardProps {
  id?: string;
  slug: string;
  name: string;
  country: string;
  costAvg?: number | null;
  safetyScore?: number | null;
  familyScore?: number | null;
  imageUrl?: string | null;
}

export default function CityCard({
  id,
  slug,
  name,
  country,
  costAvg,
  safetyScore,
  familyScore,
  imageUrl,
}: CityCardProps) {
  const imgSrc = imageUrl ?? unsplashCityUrl(name);

  return (
    <Link
      href={`/cities/${slug}`}
      className="group relative block rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="h-40 bg-muted flex items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      </div>
      {id && <SaveCityButton cityId={id} />}
      <div className="p-4">
        <p className="text-xs text-muted-foreground">{country}</p>
        <h3 className="font-semibold text-lg leading-tight">{name}</h3>
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          {costAvg != null && <span>💰 ${costAvg.toLocaleString()}/mo</span>}
          {safetyScore != null && <span>🛡 {safetyScore}</span>}
          {familyScore != null && <span>👨‍👩‍👧 {familyScore}</span>}
        </div>
      </div>
    </Link>
  );
}
