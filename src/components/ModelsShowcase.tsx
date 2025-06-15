
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap, AlertCircle } from 'lucide-react';
import { useCachedModels } from '@/hooks/useCachedModels';

interface Model {
  id: string;
  name: string;
  total_tokens_this_month: number | null;
  provider: string;
  is_enabled: boolean;
}

export const ModelsShowcase: React.FC = () => {
  const { models, loading, error } = useCachedModels();

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular AI Models This Month
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See which AI models are trending and being used by our community
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center justify-center text-2xl text-gray-900">
                  <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
                  Model Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-6 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error('ModelsShowcase error:', error);
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular AI Models This Month
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See which AI models are trending and being used by our community
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg mb-2">Unable to load model statistics</p>
                  <p className="text-sm">Please try refreshing the page</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  if (!models || models.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular AI Models This Month
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See which AI models are trending and being used by our community
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center justify-center text-2xl text-gray-900">
                  <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
                  Model Usage Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Zap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg">No usage data available for this month</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Popular AI Models This Month
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See which AI models are trending and being used by our community
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center justify-center text-2xl text-gray-900">
                <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
                Model Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {models.map((model, index) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-200 border border-blue-100"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {model.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {model.provider}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-2xl font-bold text-gray-900 mb-1">
                        <Zap className="w-5 h-5 mr-1 text-yellow-500" />
                        {(model.total_tokens_this_month || 0).toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-600">tokens used</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
