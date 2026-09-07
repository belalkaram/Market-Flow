import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { branchesApi } from '@/lib/api';
import { Building2, MapPin, ArrowLeft, Loader2 } from 'lucide-react';
import { useStaggerFadeIn } from '@/hooks/useGsap';
import { useAuth } from '@/hooks/useAuth';

export default function BranchSelectionPage() {
  const [, setLocation] = useLocation();
  const { currentUser } = useAuth();
  const containerRef = useStaggerFadeIn('.branch-card', 0.1);

  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: branchesApi.list,
  });

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto py-8" dir="rtl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">اختر الفرع</h1>
          <p className="text-muted-foreground">مرحباً <span className="font-semibold text-foreground">{currentUser?.name}</span>، الرجاء اختيار الفرع</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center h-40 items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : branches.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>لا توجد فروع مسجلة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" ref={containerRef}>
            {branches.map(branch => (
              <Card
                key={branch.id}
                className="branch-card cursor-pointer hover:border-primary hover:shadow-md transition-all duration-300 group"
                onClick={() => setLocation('/home')}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${branch.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {branch.isActive ? 'نشط' : 'موقف'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{branch.name}</h3>

                  <div className="space-y-2 text-sm text-muted-foreground mb-6">
                    {branch.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{branch.city}{branch.address ? ` — ${branch.address}` : ''}</span>
                      </div>
                    )}
                    {branch.phone && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono">{branch.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                    <span>الدخول للفرع</span>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
