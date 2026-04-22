import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { insertEmojiAtCursor } from '@/lib/utils';
import {
    addRecentEmoji,
    type Emoji,
    getCategoriesWithRecent,
    searchEmojis
} from '@/lib/whatsapp-emojis';
import { Search, Smile, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface EmojiPickerProps {
    /** Callback when an emoji is selected */
    onEmojiSelect?: (emoji: string) => void;
    /** Reference to an input/textarea for direct emoji insertion */
    targetRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
    /** Whether to close the picker after selecting an emoji (default: true) */
    autoClose?: boolean;
    /** Custom trigger element */
    trigger?: React.ReactNode;
    /** Additional class name for the trigger button */
    triggerClassName?: string;
}

const GRID_COLS = 8;

export function EmojiPicker({
    onEmojiSelect,
    targetRef,
    autoClose = true,
    trigger,
    triggerClassName,
}: EmojiPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('smileys');
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Tabs scroll controls
    const tabsListRef = useRef<HTMLDivElement>(null);

    const updateScrollButtons = useCallback(() => {
        const el = tabsListRef.current;
        if (!el) return;
    }, []);

    // Get categories with recent emojis
    const categories = useMemo(() => getCategoriesWithRecent(), [open]);

    useEffect(() => {
        updateScrollButtons();
        const el = tabsListRef.current;
        if (!el) return;
        el.addEventListener('scroll', updateScrollButtons, { passive: true });
        const ro = new ResizeObserver(updateScrollButtons);
        ro.observe(el);
        window.addEventListener('resize', updateScrollButtons);
        return () => {
            el.removeEventListener('scroll', updateScrollButtons);
            ro.disconnect();
            window.removeEventListener('resize', updateScrollButtons);
        };
    }, [categories, updateScrollButtons]);

    const scrollTabs = (dir: 'left' | 'right') => {
        const el = tabsListRef.current;
        if (!el) return;
        const amount = el.clientWidth * 0.6 * (dir === 'left' ? -1 : 1);
        el.scrollBy({ left: amount, behavior: 'smooth' });
    };


    // Search results
    const searchResults = useMemo(() => {
        if (!search.trim()) return null;
        return searchEmojis(search);
    }, [search]);

    // Handle emoji selection
    const handleEmojiClick = useCallback(
        (emoji: Emoji) => {
            // Add to recent
            addRecentEmoji(emoji);

            // Insert into target element if provided
            if (targetRef?.current) {
                insertEmojiAtCursor(targetRef.current, emoji.emoji);
            }

            // Call callback
            onEmojiSelect?.(emoji.emoji);

            // Close if autoClose is enabled
            if (autoClose) {
                setOpen(false);
                setSearch('');
            }
        },
        [onEmojiSelect, targetRef, autoClose]
    );

    // Clear search
    const handleClearSearch = useCallback(() => {
        setSearch('');
        searchInputRef.current?.focus();
    }, []);

    // Focus search input when popover opens
    useEffect(() => {
        if (open) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [open]);

    // Render emoji grid
    const renderEmojiGrid = (emojis: Emoji[], showEmpty = true) => {
        if (emojis.length === 0 && showEmpty) {
            return (
                <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                    No hay emojis recientes
                </div>
            );
        }

        return (
            <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
            >
                {emojis.map((emoji, index) => (
                    <Tooltip key={`${emoji.emoji}-${index}`} delayDuration={300}>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                className="flex items-center justify-center h-9 w-9 text-2xl rounded-md hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onClick={() => handleEmojiClick(emoji)}
                            >
                                {emoji.emoji}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                            {emoji.name}
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        );
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {trigger || (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={triggerClassName}
                    >
                        <Smile className="h-5 w-5" />
                        <span className="sr-only">Abrir selector de emojis</span>
                    </Button>
                )}
            </PopoverTrigger>

            <PopoverContent className="w-[340px] p-0" align="start" sideOffset={8}>
                {/* Search bar */}
                <div className="p-3 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Buscar emoji..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-9 h-9"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Search results or category tabs */}
                {searchResults !== null ? (
                    <ScrollArea className="h-80">
                        <div className="p-3">
                            {searchResults.length > 0 ? (
                                <>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
                                    </p>
                                    {renderEmojiGrid(searchResults, false)}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                    <p className="text-sm">No se encontraron emojis</p>
                                    <p className="text-xs mt-1">Intenta con otra búsqueda</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                ) : (
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        {/* Category tabs */}
                        <div className="relative">
                            <div
                                ref={tabsListRef}
                                className="emoji-tabs-scroll w-full h-11 p-0 rounded-none border-b bg-transparent overflow-x-auto overflow-y-hidden scroll-smooth"
                                style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--muted-foreground)) transparent' }}
                            >
                                <TabsList className="inline-flex gap-1">
                                    {categories.map((category: { id: React.Key | null | undefined; name: string | undefined; icon: any; }) => (
                                        <TabsTrigger
                                            key={category.id}
                                            value={category.id as string}
                                            className="shrink-0 px-3 text-lg data-[state=active]:bg-accent"
                                            title={category.name}
                                        >
                                            {category.icon}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>
                        </div>

                        {/* Category content */}
                        {categories.map((category: { id: React.Key | null | undefined; name: React.ReactNode; emojis: Emoji[]; }) => (
                            <TabsContent key={category.id} value={category.id as string} className="mt-0">
                                <ScrollArea className="h-[240px]">
                                    <div className="p-3">
                                        <p className="text-xs font-medium text-muted-foreground mb-2">
                                            {category.name}
                                        </p>
                                        {renderEmojiGrid(category.emojis)}
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                        ))}
                    </Tabs>
                )}
            </PopoverContent>
        </Popover>
    );
}
