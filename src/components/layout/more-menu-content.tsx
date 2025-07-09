"use client";

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { HelpCircle, MessageSquare, Info } from 'lucide-react';

export function MoreMenuContent() {
    return (
      <>
        <DropdownMenuItem className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <MessageSquare className="mr-2 h-4 w-4" />
          <span>Send Feedback</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <Info className="mr-2 h-4 w-4" />
          <span>About Color Hut</span>
        </DropdownMenuItem>
      </>
    );
  }
