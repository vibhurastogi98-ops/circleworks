"use client";

import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Award, 
  ShieldCheck, 
  Users, 
  ChevronRight,
  PlusCircle,
  TrendingUp,
  LayoutGrid,
  List,
  CheckCircle2,
  Tag,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { mockCourses } from "@/data/mockLearning";

export default function CourseCatalogPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(mockCourses.map(c => c.category)))];

  const filteredCourses = mockCourses.filter(c => 
    (selectedCategory === "All" || c.category === selectedCategory) &&
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Course Catalog</h1>
          <p className="text-slate-500 dark:text-slate-400">Discover hundreds of courses to boost your career growth.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden md:flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
             My Certificates
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95">
             <PlusCircle size={20} className="hidden sm:inline" />
             Create Course
          </button>
        </div>
      </div>

      {/* Filters & Workspace */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto flex-1">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by title, skill, or role..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 dark:text-white transition-all shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide w-full md:w-auto">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
             <button 
               onClick={() => setView('grid')}
               className={`p-1.5 rounded-md transition-all ${view === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}
             >
               <LayoutGrid size={18} />
             </button>
             <button 
               onClick={() => setView('list')}
               className={`p-1.5 rounded-md transition-all ${view === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}
             >
               <List size={18} />
             </button>
          </div>
          <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400">
             <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
        {filteredCourses.map(course => (
          <Link 
            key={course.id} 
            href={`/learning/courses/${course.id}`}
            className={`group bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/5 transition-all outline-none focus:ring-2 focus:ring-blue-500 ${view === 'list' ? 'flex items-center gap-6 p-2 pr-6' : 'flex flex-col'}`}
          >
            {/* Thumbnail */}
            <div className={`relative ${view === 'grid' ? 'h-48' : 'w-48 h-32 shrink-0 rounded-xl overflow-hidden'}`}>
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <div className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/20">
                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                 </div>
              </div>
              {course.isMandatory && (
                <div className="absolute top-3 left-3 px-3 py-1 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                   <ShieldCheck size={12} />
                   Mandatory
                </div>
              )}
            </div>

            {/* Content */}
            <div className={`p-6 flex-1 flex flex-col justify-between ${view === 'list' && 'py-2 px-0'}`}>
               <div className="space-y-2">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-tighter text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                        <Tag size={12} />
                        {course.category}
                     </span>
                     <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                        <Clock size={12} />
                        {course.duration}
                     </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                    {course.title}
                  </h3>
                  {view === 'grid' && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  )}
               </div>

               <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                     <Award size={14} className="text-amber-500" />
                     <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                       Skill Badge Included
                     </span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                        <CheckCircle2 size={12} />
                        {course.completionRate}%
                     </div>
                  </div>
               </div>
            </div>
          </Link>
        ))}
      </div>

      {/* No Results */}
      {filteredCourses.length === 0 && (
         <div className="text-center py-32 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-3">
           <BookOpen size={48} className="mx-auto text-slate-300" />
           <p className="text-slate-500 font-medium">No courses found matching your search. Try adjusting the filters.</p>
           <button onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }} className="text-blue-600 font-bold hover:underline">Reset All Filters</button>
         </div>
      )}
    </div>
  );
}
