
"use client";

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Info,
  BookOpen,
  FileText,
  FileImage,
  CreditCard,
  Contact,
  Presentation,
  Book,
} from 'lucide-react';

export function MoreMenuContent() {
    return (
      <>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Design Services</DropdownMenuLabel>
          <DropdownMenuItem className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Menu Book</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <FileText className="mr-2 h-4 w-4" />
            <span>Menu Card</span>
          </DropdownMenuItem>
           <DropdownMenuItem className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <Book className="mr-2 h-4 w-4" />
            <span>Menu Book Cover</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <FileImage className="mr-2 h-4 w-4" />
            <span>Leaflet</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Membership / Loyalty Card</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <Contact className="mr-2 h-4 w-4" />
            <span>Business Card</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <Presentation className="mr-2 h-4 w-4" />
            <span>X Banner</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <Info className="mr-2 h-4 w-4" />
            <span>About Color Hut</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </>
    );
  }
