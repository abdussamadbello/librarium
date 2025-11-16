# Quick Reference: Literary Modernism Design System

**For Developers implementing new features**

---

## 🎨 Color Quick Picks

```tsx
// Primary Actions
className="bg-primary text-primary-foreground"
className="text-primary" // Links, icons

// Accent/Discovery
className="bg-accent text-accent-foreground"
className="text-accent"

// Success (Available books)
className="bg-chart-5/90 text-white"

// Error (Overdue)
className="bg-destructive text-destructive-foreground"

// Gradients
className="bg-gradient-to-br from-primary via-primary/90 to-primary/80"
className="bg-gradient-to-br from-card to-muted/20"
```

---

## 📝 Typography Classes

```tsx
// Display Headings (Large, attention-grabbing)
<h1 className="text-display-md font-display gradient-text">...</h1>
<h1 className="text-display-sm font-serif">...</h1>

// Section Headings
<h2 className="text-3xl font-serif font-bold">...</h2>
<h3 className="text-xl font-serif font-semibold">...</h3>

// Body Text
<p className="text-base font-sans">...</p>
<p className="text-lg font-serif italic">Subheadlines</p>

// Metadata/Technical
<span className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
  METADATA
</span>

// Editorial Numbers (Stats)
<div className="text-4xl font-serif editorial-number font-bold">42</div>
```

---

## 🃏 Card Patterns

### Standard Elevated Card
```tsx
<Card className="shadow-soft hover:shadow-lift transition-all duration-500 border-0">
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### Gradient Card (Stats/Features)
```tsx
<Card className="shadow-soft hover:shadow-lift transition-all duration-500 
                 border-0 bg-gradient-to-br from-card to-muted/20 
                 group overflow-hidden relative">
  {/* Hover gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  
  <CardContent className="relative z-10">
    {/* Content */}
  </CardContent>
</Card>
```

### Card with Ornamental Border
```tsx
<Card className="shadow-soft border-0">
  <div className="p-8">
    <div className="ornamental-border pb-4 mb-6">
      <h2 className="text-3xl font-serif font-bold">Section Title</h2>
      <p className="text-muted-foreground mt-1 font-mono text-sm">Subtitle</p>
    </div>
    {/* Content */}
  </div>
</Card>
```

---

## 🎬 Animation Classes

### Page Load Animations
```tsx
// Single element
<div className="fade-in-up">...</div>

// Staggered group (use on children)
<div className="fade-in-up stagger-1">First</div>
<div className="fade-in-up stagger-2">Second</div>
<div className="fade-in-up stagger-3">Third</div>
```

### Hover Effects
```tsx
// Book cards or similar
<div className="book-card-lift">
  {/* Lifts -12px and scales 1.02 on hover */}
</div>

// Shimmer effect
<div className="shimmer">
  {/* Animated gradient sweep */}
</div>

// Icon scale
<Icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-500" />
```

---

## 🎨 Gradient Backgrounds

### Hero Sections
```tsx
<section className="p-12 bg-gradient-to-br from-primary via-primary/90 to-primary/80 
                    rounded-2xl shadow-dramatic relative overflow-hidden">
  {/* Decorative blur orbs */}
  <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
  <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
  
  <div className="relative z-10">
    {/* Content */}
  </div>
</section>
```

### Directional Accent
```tsx
{/* Right-side gradient accent */}
<div className="absolute top-0 right-0 w-1/2 h-full 
                bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />

{/* Left-side gradient accent */}
<div className="absolute top-0 left-0 w-1/2 h-full 
                bg-gradient-to-r from-accent/5 to-transparent pointer-events-none" />
```

---

## 🏷️ Badge Styles

```tsx
// Available/Success
<Badge className="bg-chart-5/90 backdrop-blur-sm shadow-lg border-0 font-mono text-xs">
  Available
</Badge>

// Out/Error
<Badge variant="destructive" className="backdrop-blur-sm shadow-lg font-mono text-xs">
  Out
</Badge>

// Category/Metadata
<Badge variant="outline" className="text-xs border-primary/20 text-primary font-mono">
  Fiction
</Badge>

// Filter chips
<Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 
                 cursor-pointer hover:bg-white/30 transition-colors px-4 py-1.5 font-sans">
  Category ✕
</Badge>
```

---

## 🔘 Button Styles

```tsx
// Primary action
<Button className="bg-gradient-to-r from-primary to-primary/80 
                   hover:from-primary/90 hover:to-primary/70 
                   shadow-lg hover:shadow-xl transition-all">
  Browse Books
</Button>

// Accent action
<Button className="bg-accent hover:bg-accent/90 text-foreground 
                   px-8 py-6 text-base font-semibold 
                   shadow-lg hover:shadow-xl transition-all duration-300 
                   rounded-xl border-0 font-sans">
  Search Library
</Button>

// Outline
<Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow">
  Secondary
</Button>
```

---

## 📊 Stat Card Pattern

```tsx
<Card className="shadow-soft hover:shadow-lift transition-all duration-500 
                 border-0 bg-gradient-to-br from-card to-muted/20 
                 group overflow-hidden relative">
  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  
  <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
    <CardTitle className="text-sm font-medium text-muted-foreground 
                          tracking-wide uppercase font-sans">
      Label
    </CardTitle>
    <div className="p-2 rounded-lg bg-primary/10">
      <Icon className="w-5 h-5 text-primary" />
    </div>
  </CardHeader>
  
  <CardContent className="relative z-10">
    <div className="text-4xl font-serif editorial-number font-bold 
                    bg-gradient-to-br from-primary to-primary/70 
                    bg-clip-text text-transparent">
      42
    </div>
    <p className="text-xs text-muted-foreground mt-1 font-mono">
      Description
    </p>
  </CardContent>
</Card>
```

---

## 📚 Book Card Pattern

```tsx
<Link href={`/member/books/${bookId}`}>
  <div className="flex-shrink-0 w-56 group cursor-pointer">
    {/* Cover */}
    <div className="relative rounded-xl overflow-hidden shadow-soft book-card-lift">
      <div className="w-full h-80 bg-gradient-to-br from-primary/10 via-accent/20 to-primary/5 
                      flex items-center justify-center p-6 relative overflow-hidden">
        {/* Dot pattern texture */}
        <div className="absolute inset-0 opacity-5 
                        bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary))_1px,transparent_1px)] 
                        bg-[length:20px_20px]"></div>
        
        {/* Icon */}
        <div className="p-4 rounded-2xl bg-primary/10 backdrop-blur-sm 
                        group-hover:scale-110 transition-transform duration-500">
          <BookOpen className="w-14 h-14 text-primary" />
        </div>
        
        {/* Shimmer on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 
                        transition-opacity duration-500 shimmer pointer-events-none"></div>
      </div>
      
      {/* Badge */}
      <div className="absolute top-3 right-3 z-20">
        <Badge className="bg-chart-5/90 backdrop-blur-sm shadow-lg border-0 font-mono text-xs">
          Available
        </Badge>
      </div>
    </div>
    
    {/* Metadata */}
    <div className="mt-4 px-1">
      <h3 className="font-serif text-base font-semibold text-foreground 
                     group-hover:text-primary transition-colors line-clamp-2 mb-1">
        Book Title
      </h3>
      <p className="text-sm text-muted-foreground font-sans mb-2">
        Author Name
      </p>
      <Badge variant="outline" className="text-xs border-primary/20 text-primary font-mono">
        Category
      </Badge>
    </div>
  </div>
</Link>
```

---

## 🎯 Empty States

```tsx
<div className="text-center py-20 relative">
  {/* Decorative background */}
  <div className="absolute inset-0 
                  bg-[radial-gradient(circle_at_center,hsl(var(--primary))_1px,transparent_1px)] 
                  bg-[length:24px_24px] opacity-5"></div>
  
  {/* Icon */}
  <div className="inline-flex p-6 rounded-full bg-muted/50 mb-4">
    <BookOpen className="w-16 h-16 text-muted-foreground/40 animate-float" />
  </div>
  
  {/* Message */}
  <h3 className="text-xl font-serif font-semibold mb-2">No Items Found</h3>
  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
    Description of empty state
  </p>
  
  {/* Action */}
  <Button className="bg-gradient-to-r from-primary to-primary/80 
                     shadow-lg hover:shadow-xl transition-all">
    Take Action
  </Button>
</div>
```

---

## 🔄 Loading States

```tsx
{/* Spinner */}
<div className="text-center py-16">
  <div className="inline-block animate-spin rounded-full h-16 w-16 
                  border-4 border-primary/20 border-t-primary mb-4"></div>
  <p className="text-muted-foreground font-mono text-sm">
    Loading message...
  </p>
</div>
```

---

## 🎨 Color Utilities

```tsx
// Gradient text
<h1 className="gradient-text">Ocean gradient</h1>
<h1 className="gradient-warm-text">Amber gradient</h1>

// Shadows
className="shadow-soft"     // Rest state
className="shadow-lift"     // Hover state
className="shadow-dramatic" // Hero sections
```

---

## 🏗️ Layout Patterns

### Section with Ornamental Border
```tsx
<div className="ornamental-border pb-6 mb-8">
  <h2 className="text-3xl font-serif font-bold text-foreground">
    Section Title
  </h2>
  <p className="text-muted-foreground mt-1 font-mono text-sm">
    Subtitle or description
  </p>
</div>
```

### Horizontal Carousel
```tsx
<div className="flex space-x-6 overflow-x-auto pb-6 scrollbar-hide">
  {items.map((item, index) => (
    <div key={item.id} 
         className="fade-in-up" 
         style={{ animationDelay: `${index * 0.1}s` }}>
      <BookCard item={item} />
    </div>
  ))}
</div>
```

---

## ⚡ Quick Tips

1. **Always use relative z-10** for content above gradient overlays
2. **Group hover effects:** Use `group` on parent, `group-hover:` on children
3. **Stagger animations:** Max 6 items, then reset (prevents delay overload)
4. **Icon sizes:** sm=20px, md=24px, lg=32px, xl=48px
5. **Padding:** Cards should breathe - use p-6 or p-8 minimum
6. **Rounded corners:** Use rounded-xl (16px) or rounded-2xl (20px) for modern feel
7. **Transitions:** Standard 500ms for smoothness, 300ms for snappy
8. **Font features:** Typography automatically applies kerning, ligatures

---

## 🚫 What NOT to Do

❌ Mix serif and sans randomly - stick to hierarchy
❌ Use basic shadows (shadow-md) - use design system (shadow-soft)
❌ Forget dark mode - colors are in CSS vars for easy theming
❌ Ignore stagger delays - they create rhythm
❌ Skip empty states - they're part of the experience
❌ Use generic gradients - commit to the primary/accent palette

---

## ✅ Checklist for New Components

- [ ] Used appropriate typography (serif for display, sans for UI)
- [ ] Applied shadow-soft and hover:shadow-lift
- [ ] Added fade-in-up animation
- [ ] Included empty state design
- [ ] Used font-mono for metadata
- [ ] Applied proper spacing (p-6+)
- [ ] Added group hover interactions
- [ ] Tested keyboard navigation
- [ ] Ensured WCAG AA contrast
- [ ] Checked on mobile viewport

---

**Remember:** Every component should feel like part of a literary magazine, not a generic web app.

**When in doubt:** Look at existing dashboard or discover page for patterns.
