import { useAuth } from '@/hooks/useAuth';
import { useSupabaseTest } from '@/hooks/useSupabaseTest';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, TestTube, User, LogOut } from 'lucide-react';

export function AuthStatus() {
  const { user, signOut, loading } = useAuth();
  const { testConnection, isTestingConnection } = useSupabaseTest();

  if (loading) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verificando autenticação...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Status da Conexão
          </span>
          {user && (
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span>Autenticação:</span>
          {user ? (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Conectado
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              Desconectado
            </Badge>
          )}
        </div>
        
        {user && (
          <div className="text-sm text-muted-foreground">
            <p>Email: {user.email}</p>
            <p>ID: {user.id}</p>
          </div>
        )}

        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={testConnection}
            disabled={isTestingConnection}
            className="w-full"
          >
            {isTestingConnection ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Testar Conexão com Supabase
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}