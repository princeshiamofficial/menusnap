"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { cn } from "@/lib/utils"

import { AlertCircle, AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant = "default", ...props }) {
        const Icon = variant === "destructive" ? XCircle : 
                    variant === "success" ? CheckCircle : 
                    variant === "warning" ? AlertTriangle :
                    variant === "info" ? Info : Info;

        const iconColor = variant === "destructive" ? "text-[#d10d0d]" : 
                         variant === "success" ? "text-[#0d810d]" : 
                         variant === "warning" ? "text-amber-600" :
                         variant === "info" ? "text-blue-600" : "text-slate-900";
        
        const bgColor = variant === "destructive" ? "bg-[#fc0c0c]/[0.1] sm:bg-[#fc0c0c]/[0.2]" : 
                        variant === "success" ? "bg-[#10b981]/[0.15]" : 
                        variant === "warning" ? "bg-amber-100" :
                        variant === "info" ? "bg-blue-100" : "bg-slate-100";
        
        const waveColor = variant === "destructive" ? "fill-[#fc0c0c]/[0.2]" : 
                          variant === "success" ? "fill-[#0d810d]/[0.15]" : 
                          variant === "warning" ? "fill-amber-500/20" :
                          variant === "info" ? "fill-blue-500/20" : "fill-slate-500/10";

        return (
          <Toast key={id} variant={variant} {...props} className="gap-2 overflow-hidden">
            {/* Wave SVG background */}
            <svg
              className={cn("absolute -left-[31px] top-[32px] w-[80px] rotate-90", waveColor)}
              viewBox="0 0 1440 320"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L1428.6,320C1417.1,320,1394,320,1371,320C1348.6,320,1326,320,1303,320C1280,320,1257,320,1234,320C1211.4,320,1189,320,1166,320C1142.9,320,1120,320,1097,320C1074.3,320,1051,320,1029,320C1005.7,320,983,320,960,320C937.1,320,914,320,891,320C868.6,320,846,320,823,320C800,320,777,320,754,320C731.4,320,709,320,686,320C662.9,320,640,320,617,320C594.3,320,571,320,549,320C525.7,320,503,320,480,320C457.1,320,434,320,411,320C388.6,320,366,320,343,320C320,320,297,320,274,320C251.4,320,229,320,206,320C182.9,320,160,320,137,320C114.3,320,91,320,69,320C45.7,320,23,320,11,320L0,320Z" />
            </svg>

            <div className={cn("z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full", bgColor)}>
              <Icon className={cn("h-4 w-4", iconColor)} />
            </div>

            <div className="z-10 flex flex-col items-start justify-center flex-grow py-1 pr-2">
              {title && (
                <ToastTitle className={cn("font-bold text-[17px] leading-tight mb-0", iconColor)}>
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription className="text-sm font-medium text-slate-500 leading-tight">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <div className="z-10 bg-white">
              <ToastClose className="hover:bg-slate-50 rounded-full" />
            </div>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
