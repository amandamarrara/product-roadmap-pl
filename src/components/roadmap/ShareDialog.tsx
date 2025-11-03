import { useState } from "react";
import { Share2, Copy, Check, X, Eye, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useRoadmapShares,
  useShareRoadmap,
  useRemoveShare,
  useUpdateSharePermission,
} from "@/hooks/useRoadmapSharing";
import { useAuth } from "@/hooks/useAuth";

interface ShareDialogProps {
  roadmapId: string;
  roadmapTitle: string;
}

export function ShareDialog({ roadmapId, roadmapTitle }: ShareDialogProps) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<'viewer' | 'editor'>('viewer');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { user } = useAuth();
  const { data: shares = [], isLoading } = useRoadmapShares(roadmapId);
  const shareRoadmap = useShareRoadmap();
  const removeShare = useRemoveShare();
  const updatePermission = useUpdateSharePermission();

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return;
    }

    await shareRoadmap.mutateAsync({
      roadmapId,
      email: email.toLowerCase().trim(),
      permission,
    });

    setEmail("");
    setPermission('viewer');
  };

  const handleCopyLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/roadmap/${roadmapId}?invite=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleRemoveShare = (shareId: string) => {
    removeShare.mutate({ shareId, roadmapId });
  };

  const handleUpdatePermission = (shareId: string, newPermission: 'viewer' | 'editor') => {
    updatePermission.mutate({ shareId, roadmapId, permission: newPermission });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Compartilhar "{roadmapTitle}"</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add people form */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Adicionar pessoas</h3>
            <form onSubmit={handleShare} className="flex gap-2">
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Select value={permission} onValueChange={(v) => setPermission(v as 'viewer' | 'editor')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <Eye className="h-3 w-3" />
                      Visualizador
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex items-center gap-2">
                      <Edit className="h-3 w-3" />
                      Editor
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={shareRoadmap.isPending}>
                Compartilhar
              </Button>
            </form>
            <p className="text-xs text-muted-foreground">
              A pessoa receberá um link de acesso por email ou você pode copiar o link abaixo
            </p>
          </div>

          {/* People with access */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Pessoas com acesso</h3>
            <div className="border rounded-lg divide-y">
              {/* Owner */}
              <div className="p-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {user?.email?.[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user?.email}</p>
                      <Badge variant="secondary" className="mt-1">Proprietário</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shared users */}
              {isLoading ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  Carregando...
                </div>
              ) : shares.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  Nenhum compartilhamento ainda
                </div>
              ) : (
                shares.map((share) => (
                  <div key={share.id} className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-secondary/50 flex items-center justify-center text-sm font-medium">
                          {share.sharedWithEmail[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{share.sharedWithEmail}</p>
                          {!share.sharedWithUserId && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              Pendente
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={share.permission}
                          onValueChange={(v) => handleUpdatePermission(share.id, v as 'viewer' | 'editor')}
                        >
                          <SelectTrigger className="w-[130px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">
                              <div className="flex items-center gap-2">
                                <Eye className="h-3 w-3" />
                                Visualizador
                              </div>
                            </SelectItem>
                            <SelectItem value="editor">
                              <div className="flex items-center gap-2">
                                <Edit className="h-3 w-3" />
                                Editor
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRemoveShare(share.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleCopyLink(share.inviteToken)}
                      >
                        {copiedToken === share.inviteToken ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copiar link de convite
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Info alert */}
          <Alert>
            <AlertDescription className="text-xs">
              <strong>Como funciona:</strong> Ao compartilhar, a pessoa precisa fazer login com o email informado
              para ter acesso ao roadmap. Você pode copiar o link de convite e enviar diretamente.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}
