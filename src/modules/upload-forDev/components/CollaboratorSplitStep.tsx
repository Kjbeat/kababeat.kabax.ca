import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BeatFormData } from "../types";
import { X, Plus, Check, UserPlus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type BeatFormField = keyof BeatFormData;

interface CollaboratorSplitStepProps {
  formData: BeatFormData;
  onFormDataChange: (field: BeatFormField, value: unknown) => void;
}

export function CollaboratorSplitStep({ formData, onFormDataChange }: CollaboratorSplitStepProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [percent, setPercent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Inline edit state for existing collaborator percentages
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingPercent, setEditingPercent] = useState("");
  const percentInputRef = useRef<HTMLInputElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectedUserId && percentInputRef.current) {
      percentInputRef.current.focus();
    }
  }, [selectedUserId]);

  // Mock users (would come from API)
  const MOCK_USERS = useMemo(() => [
    { id: "u1", name: "Ava Stone", email: "ava@example.com" },
    { id: "u2", name: "Jay Carter", email: "jay.c@example.com" },
    { id: "u3", name: "Mia Beats", email: "mia@beatmail.com" },
    { id: "u4", name: "Liam Rhodes", email: "liam.rhodes@example.com" },
    { id: "u5", name: "Nova Pulse", email: "nova@pulse.fm" },
    { id: "u6", name: "Echo Wave", email: "echo.wave@example.com" }
  ], []);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [] as { id: string; name: string; email: string }[];
    const q = query.toLowerCase();
    return MOCK_USERS.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .filter(u => !formData.collaborators.some(c => c.name === u.name));
  }, [query, MOCK_USERS, formData.collaborators]);

  const allocated = formData.collaborators.reduce((acc, c) => acc + c.percent, 0);
  const ownerShare = Math.max(0, 100 - allocated);
  const remaining = ownerShare; // same conceptually

  const validPercent = () => {
    const p = parseFloat(percent);
    if (isNaN(p)) return false;
    return p > 0 && p <= remaining;
  };


  const add = () => {
    const p = parseFloat(percent);
    if (!query.trim() || !validPercent()) return;
    const user = MOCK_USERS.find(u => u.id === selectedUserId);
    onFormDataChange("collaborators", [
      ...formData.collaborators,
      { id: user?.id, name: query.trim(), email: user?.email, percent: p }
    ]);
    setQuery("");
    setPercent("");
    setIsEditing(false);
    setSelectedUserId(null);
    setShowSuggestions(false);
  };

  const cancel = () => {
    setQuery("");
    setPercent("");
    setIsEditing(false);
  setSelectedUserId(null);
  setShowSuggestions(false);
  };

  const remove = (idx: number) => {
    onFormDataChange("collaborators", formData.collaborators.filter((_, i) => i !== idx));
  };

  const handleSelectUser = (id: string, name: string) => {
    setSelectedUserId(id);
    setQuery(name);
    setShowSuggestions(false);
    if (!percent) setPercent("");
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (selectedUserId && percentInputRef.current) {
        percentInputRef.current.focus();
        return;
      }
      if (suggestions.length > 0) {
        const first = suggestions[0];
        handleSelectUser(first.id, first.name);
        setTimeout(() => percentInputRef.current?.focus(), 0);
      } else {
        // Accept free-form name/email input
        setSelectedUserId(null);
        setShowSuggestions(false);
        setTimeout(() => percentInputRef.current?.focus(), 0);
      }
    }
  };

  const startEditPercent = (index: number) => {
    const current = formData.collaborators[index];
    setEditingIndex(index);
    setEditingPercent(String(current.percent));
  };

  const saveEditPercent = () => {
    if (editingIndex === null) return;
    const p = parseFloat(editingPercent);
    if (isNaN(p) || p <= 0) return;
    const othersTotal = formData.collaborators.reduce((acc, c, i) => i === editingIndex ? acc : acc + c.percent, 0);
    if (p + othersTotal > 100) return; // invalid
    const updated = formData.collaborators.map((c, i) => i === editingIndex ? { ...c, percent: p } : c);
    onFormDataChange("collaborators", updated);
    setEditingIndex(null);
    setEditingPercent("");
  };

  const cancelEditPercent = () => {
    setEditingIndex(null);
    setEditingPercent("");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">{t('upload.collaborator.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('upload.collaborator.description')}</p>
      </div>
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">{t('upload.collaborator.allocation')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-12 text-xs font-medium uppercase tracking-wide text-muted-foreground border-b pb-2">
            <div className="col-span-8">{t('upload.collaborator.collaborators')}</div>
            <div className="col-span-2 text-right">{t('upload.collaborator.profitShare')}</div>
            <div className="col-span-2" />
          </div>
          {/* Owner Row */}
            <div className="grid grid-cols-12 items-center py-3 border-b/50">
              <div className="col-span-8 font-semibold text-sm">{t('upload.collaborator.you')}</div>
              <div className="col-span-2 text-right text-sm">{ownerShare}%</div>
              <div className="col-span-2" />
            </div>
          {/* Existing collaborators */}
          {formData.collaborators.map((c, i) => {
            const othersTotal = formData.collaborators.reduce((acc, col, idx) => idx === i ? acc : acc + col.percent, 0);
            const maxForEdit = 100 - othersTotal;
            const invalidEdit = editingIndex === i && (isNaN(parseFloat(editingPercent)) || parseFloat(editingPercent) <= 0 || parseFloat(editingPercent) > maxForEdit);
            return (
              <div key={i} className="grid grid-cols-12 items-center py-2 border-b/20">
                <div className="col-span-8 flex flex-col">
                  <span className="text-sm font-medium truncate">{c.name}</span>
                </div>
                <div className="col-span-2 text-right text-sm font-medium">
                  {editingIndex === i ? (
                    <div className="flex items-center justify-end gap-2">
                      <Input
                        className={`h-7 w-20 text-right ${invalidEdit ? 'border-destructive' : ''}`}
                        value={editingPercent}
                        type="number"
                        min={1}
                        max={maxForEdit}
                        onChange={e => setEditingPercent(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !invalidEdit) saveEditPercent(); if (e.key === 'Escape') cancelEditPercent(); }}
                        autoFocus
                      />
                      <Button size="icon" variant="secondary" className="h-7 w-7" disabled={invalidEdit} onClick={saveEditPercent}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" className="h-7 w-7" onClick={cancelEditPercent}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <button type="button" className="underline-offset-2 hover:underline" onClick={() => startEditPercent(i)}>
                      {c.percent}%
                    </button>
                  )}
                </div>
                <div className="col-span-2 flex justify-end">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Add collaborator row */}
          <div className="grid grid-cols-12 gap-3 items-center pt-2">
            <div className="col-span-8">
              <Input
                ref={nameInputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); setIsEditing(true); setShowSuggestions(true); setSelectedUserId(null); }}
                onFocus={() => { if (query) setShowSuggestions(true); }}
                onKeyDown={handleNameKeyDown}
                placeholder={t('upload.collaborator.searchAndSelectUser')}
                className="bg-muted/40"
              />
              {isEditing && !query && (
                <div className="mt-1 text-[11px] text-muted-foreground italic">{t('upload.collaborator.typeNameOrEmail')}</div>
              )}
              {query && suggestions.length === 0 && (
                <div className="mt-1 text-[11px] text-muted-foreground italic">{t('upload.collaborator.noUsersFound')}</div>
              )}
              {showSuggestions && suggestions.length > 0 && (
                <div className="mt-1 rounded-md border border-border/60 bg-popover text-popover-foreground shadow-sm max-h-44 overflow-auto">
                  {suggestions.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectUser(u.id, u.name)}
                      className={`w-full text-left px-3 py-2 text-xs transition flex flex-col rounded-sm hover:bg-accent/30`}
                    >
                      <span className="font-medium leading-tight">{u.name}</span>
                      <span className="text-[10px] text-muted-foreground">{u.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="col-span-2">
              <Input
                ref={percentInputRef}
                value={percent}
                onChange={e => { setPercent(e.target.value); setIsEditing(true); }}
                placeholder={t('upload.collaborator.share')}
                type="number"
                min={1}
                max={remaining}
                className="bg-muted/40 text-right"
                onKeyDown={e => { if (e.key === 'Enter' && validPercent() && query.trim()) add(); }}
              />
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                disabled={!validPercent() || !query.trim()}
                onClick={add}
                className="h-8 w-8"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="destructive"
                disabled={!query && !percent}
                onClick={cancel}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t mt-2">
            <div className="text-xs text-muted-foreground">{t('upload.collaborator.totalAllocated').replace('{allocated}', allocated.toString()).replace('{remaining}', remaining.toString())}</div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              disabled={remaining === 0}
              className="gap-1"
            >
              <UserPlus className="h-4 w-4" /> {t('upload.collaborator.addCollaborator')}
            </Button>
          </div>
          {remaining === 0 && allocated + ownerShare === 100 && (
            <p className="text-xs text-green-600">{t('upload.collaborator.splitComplete')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
