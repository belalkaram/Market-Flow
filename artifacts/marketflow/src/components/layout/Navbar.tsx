import { Menu, Search, Bell, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { Link } from 'wouter';

interface NavbarProps {
  toggleSidebar: () => void;
  openMobileSidebar: () => void;
}

export function Navbar({ toggleSidebar, openMobileSidebar }: NavbarProps) {
  const { currentUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-14 md:h-16 border-b border-border bg-background flex items-center justify-between px-3 md:px-4 sticky top-0 z-30 shrink-0">
      {/* Right side — hamburger + search */}
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={openMobileSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="hidden md:flex" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden sm:flex relative w-48 md:w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث سريع..." className="pr-9 h-9" />
        </div>
      </div>

      {/* Left side — actions */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Dark mode toggle */}
        <Button
          variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications */}
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="relative h-8 w-8 md:h-9 md:w-9">
            <Bell className="h-4 w-4" />
          </Button>
        </Link>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 md:h-9 md:w-9 rounded-full">
              <Avatar className="h-8 w-8 md:h-9 md:w-9 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {currentUser?.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" style={{ direction: 'rtl' }}>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-semibold">{currentUser?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {currentUser?.roleName ?? currentUser?.role}
                  {currentUser?.branchName ? ` · ${currentUser.branchName}` : ''}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/profile">
              <DropdownMenuItem>الملف الشخصي</DropdownMenuItem>
            </Link>
            <Link href="/settings">
              <DropdownMenuItem>الإعدادات</DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500" onClick={logout}>
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
