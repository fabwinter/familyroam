'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PaywallGate from '@/components/PaywallGate';
import ReviewForm from '@/components/ReviewForm';
import ReviewList from '@/components/ReviewList';
import { formatCurrency } from '@/lib/utils';

interface Hub {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  priceMin: number | null;
  priceMax: number | null;
  currency: string;
  amenities: string[];
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  visitedAt: Date | null;
  createdAt: Date;
  user: { id: string; name: string | null; avatarUrl: string | null };
}

interface VisaInfo {
  id: string;
  passportCountry: string;
  visaRequired: boolean;
  stayDays: number | null;
  visaType: string | null;
  notes: string | null;
}

interface CityTabsProps {
  cityId: string;
  costMin: number | null;
  costAvg: number | null;
  costMax: number | null;
  aqiAvg: number | null;
  safetyScore: number | null;
  familyScore: number | null;
  internetScore: number | null;
  hubs: Hub[];
  reviews: Review[];
  visaInfo: VisaInfo[];
  isPro: boolean;
  currentUserId: string | null;
}

function ScoreBar({ label, value }: { label: string; value: number | null }) {
  if (value == null) return null;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value.toFixed(0)}/100</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function CityTabs({
  cityId,
  costMin,
  costAvg,
  costMax,
  aqiAvg,
  safetyScore,
  familyScore,
  internetScore,
  hubs,
  reviews,
  visaInfo,
  isPro,
  currentUserId,
}: CityTabsProps) {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="flex-wrap h-auto gap-1 mb-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="cost">Cost</TabsTrigger>
        <TabsTrigger value="family">Family Life</TabsTrigger>
        <TabsTrigger value="hubs">Hubs</TabsTrigger>
        <TabsTrigger value="visa">Visa &amp; Legal</TabsTrigger>
        <TabsTrigger value="community">Community Notes</TabsTrigger>
      </TabsList>

      {/* Overview — always free */}
      <TabsContent value="overview">
        <div className="grid sm:grid-cols-3 gap-6">
          {costAvg != null && (
            <div className="rounded-lg border bg-card p-5 text-center">
              <p className="text-sm text-muted-foreground">Avg. Monthly Cost</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(costAvg)}</p>
            </div>
          )}
          {safetyScore != null && (
            <div className="rounded-lg border bg-card p-5 text-center">
              <p className="text-sm text-muted-foreground">Safety Score</p>
              <p className="text-2xl font-bold mt-1">{safetyScore.toFixed(0)}/100</p>
            </div>
          )}
          {familyScore != null && (
            <div className="rounded-lg border bg-card p-5 text-center">
              <p className="text-sm text-muted-foreground">Family Score</p>
              <p className="text-2xl font-bold mt-1">{familyScore.toFixed(0)}/100</p>
            </div>
          )}
        </div>
      </TabsContent>

      {/* Cost — pro */}
      <TabsContent value="cost">
        <PaywallGate isPro={isPro}>
          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { label: 'Budget', value: costMin },
                { label: 'Average', value: costAvg },
                { label: 'Comfortable', value: costMax },
              ].map(({ label, value }) =>
                value != null ? (
                  <div key={label} className="rounded-lg border bg-card p-5 text-center">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(value)}/mo</p>
                  </div>
                ) : null
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              All figures are estimates for a family of 4 (USD/month). Sources: Numbeo.
            </p>
          </div>
        </PaywallGate>
      </TabsContent>

      {/* Family Life — pro */}
      <TabsContent value="family">
        <PaywallGate isPro={isPro}>
          <div className="space-y-4 max-w-md">
            <ScoreBar label="Family Score" value={familyScore} />
            <ScoreBar label="Safety Score" value={safetyScore} />
            <ScoreBar label="Internet Speed" value={internetScore} />
            {aqiAvg != null && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Air Quality Index (AQI)</span>
                  <span className={`font-medium ${aqiAvg <= 50 ? 'text-green-600' : aqiAvg <= 100 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {aqiAvg.toFixed(0)} {aqiAvg <= 50 ? '(Good)' : aqiAvg <= 100 ? '(Moderate)' : '(Unhealthy)'}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${aqiAvg <= 50 ? 'bg-green-500' : aqiAvg <= 100 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min((aqiAvg / 300) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </PaywallGate>
      </TabsContent>

      {/* Hubs — pro */}
      <TabsContent value="hubs">
        <PaywallGate isPro={isPro}>
          {hubs.length === 0 ? (
            <p className="text-muted-foreground">No hubs listed for this city yet.</p>
          ) : (
            <div className="space-y-4">
              {hubs.map((hub) => (
                <div key={hub.id} className="rounded-lg border bg-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{hub.name}</h3>
                      {hub.description && (
                        <p className="text-sm text-muted-foreground mt-1">{hub.description}</p>
                      )}
                      {hub.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {hub.amenities.map((a) => (
                            <span key={a} className="text-xs rounded-full border px-2 py-0.5">
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {hub.priceMin != null && (
                        <p className="text-sm font-medium">
                          {formatCurrency(hub.priceMin, hub.currency)}
                          {hub.priceMax != null && ` – ${formatCurrency(hub.priceMax, hub.currency)}`}
                          /mo
                        </p>
                      )}
                      {hub.website && (
                        <a
                          href={hub.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline mt-1 block"
                        >
                          Visit website →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PaywallGate>
      </TabsContent>

      {/* Visa & Legal — pro */}
      <TabsContent value="visa">
        <PaywallGate isPro={isPro}>
          {visaInfo.length === 0 ? (
            <p className="text-muted-foreground">No visa information available for this city yet.</p>
          ) : (
            <div className="space-y-3">
              {visaInfo.map((v) => (
                <div key={v.id} className="rounded-lg border bg-card p-4 flex items-start gap-4">
                  <div className="shrink-0 text-lg font-semibold w-10 text-center">
                    {v.passportCountry.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                          v.visaRequired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {v.visaRequired ? 'Visa required' : 'Visa free'}
                      </span>
                      {v.visaType && (
                        <span className="text-xs text-muted-foreground">{v.visaType}</span>
                      )}
                      {v.stayDays != null && (
                        <span className="text-xs text-muted-foreground">Up to {v.stayDays} days</span>
                      )}
                    </div>
                    {v.notes && <p className="text-sm text-muted-foreground">{v.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </PaywallGate>
      </TabsContent>

      {/* Community Notes */}
      <TabsContent value="community">
        <ReviewList reviews={reviews} isPro={isPro} />
        {currentUserId && isPro && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Write a review</h3>
            <ReviewForm cityId={cityId} />
          </div>
        )}
        {currentUserId && !isPro && (
          <PaywallGate isPro={false}>
            <div className="mt-8 p-6 rounded-lg border">
              <p className="text-muted-foreground">Upgrade to write a review.</p>
            </div>
          </PaywallGate>
        )}
        {!currentUserId && (
          <p className="mt-6 text-sm text-muted-foreground">
            <a href="/auth/login" className="text-primary hover:underline">Sign in</a> to write a review.
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}
