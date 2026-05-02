"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreVertical, Loader2 } from "lucide-react";
import { getAllResponses } from "@/app/actions/responses";

export default function ResponsesPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    hiring: any[];
    freeDesign: any[];
    teamTracker: any[];
  }>({
    hiring: [],
    freeDesign: [],
    teamTracker: []
  });

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    setLoading(true);
    const res = await getAllResponses();
    if (res.success && res.data) {
      setData(res.data);
    }
    setLoading(false);
  };

  const getBTypeStyles = (type: string) => {
    const types: Record<string, string> = {
      'restaurant': 'bg-orange-50 text-orange-600 border-orange-100',
      'parlour': 'bg-purple-50 text-purple-600 border-purple-100',
      'cafe': 'bg-emerald-50 text-emerald-600 border-emerald-100',
      'shop': 'bg-blue-50 text-blue-600 border-blue-100',
    };
    return types[type?.toLowerCase()] || 'bg-slate-50 text-slate-600 border-slate-100';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(',', ' •');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-slate-500 font-medium">Loading responses...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Responses</h1>
          <p className="text-slate-500 mt-1">Manage all incoming service requests</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-white px-4 py-1.5 rounded-lg border-slate-200 font-bold">
            Total: {data.hiring.length + data.freeDesign.length + data.teamTracker.length}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="free-design" className="space-y-6">
        <TabsList className="bg-slate-100/80 p-1 rounded-xl border border-slate-200">
          <TabsTrigger value="free-design" className="rounded-lg px-6 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Free Design ({data.freeDesign.length})
          </TabsTrigger>
          <TabsTrigger value="team-tracker" className="rounded-lg px-6 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Team Tracker ({data.teamTracker.length})
          </TabsTrigger>
          <TabsTrigger value="hiring" className="rounded-lg px-6 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Hiring ({data.hiring.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="free-design">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle className="text-lg font-bold">Free Design Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold pl-6">Date</TableHead>
                    <TableHead className="font-bold">Business</TableHead>
                    <TableHead className="font-bold">Phone</TableHead>
                    <TableHead className="font-bold">B•Type</TableHead>
                    <TableHead className="font-bold">Required Design</TableHead>
                    <TableHead className="font-bold text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.freeDesign.map((res) => (
                    <TableRow key={res.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="text-slate-400 text-sm pl-6">{formatDate(res.created_at)}</TableCell>
                      <TableCell className="font-bold text-slate-900">{res.business_name}</TableCell>
                      <TableCell className="font-mono text-sm">{res.whatsapp_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getBTypeStyles(res.business_type)}>
                          {res.business_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium">
                        <span className="capitalize">{res.required_design?.replace('_', ' ')}</span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end">
                          <button className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-orange-500 transition-all">
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.freeDesign.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-slate-400">No requests found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team-tracker">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle className="text-lg font-bold">Team Tracker Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold pl-6">Date</TableHead>
                    <TableHead className="font-bold">Business</TableHead>
                    <TableHead className="font-bold">Phone</TableHead>
                    <TableHead className="font-bold">B•Type</TableHead>
                    <TableHead className="font-bold">Goal</TableHead>
                    <TableHead className="font-bold text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.teamTracker.map((res) => (
                    <TableRow key={res.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="text-slate-400 text-sm pl-6">{formatDate(res.created_at)}</TableCell>
                      <TableCell className="font-bold text-slate-900">{res.business_name}</TableCell>
                      <TableCell className="font-mono text-sm">{res.whatsapp_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100">
                          {res.business_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 max-w-[200px] truncate">{res.goal}</TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end">
                          <button className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-orange-500 transition-all">
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.teamTracker.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-slate-400">No requests found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hiring">
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle className="text-lg font-bold">Hiring Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="font-bold pl-6">Date</TableHead>
                    <TableHead className="font-bold">Business</TableHead>
                    <TableHead className="font-bold">Phone</TableHead>
                    <TableHead className="font-bold">Department</TableHead>
                    <TableHead className="font-bold">Requirement</TableHead>
                    <TableHead className="font-bold text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.hiring.map((res) => (
                    <TableRow key={res.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="text-slate-400 text-sm pl-6">{formatDate(res.created_at)}</TableCell>
                      <TableCell className="font-bold text-slate-900">{res.business_name}</TableCell>
                      <TableCell className="font-mono text-sm">{res.whatsapp_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                          {res.department || 'General'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">{res.requirement}</TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end">
                          <button className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-orange-500 transition-all">
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.hiring.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-slate-400">No requests found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
