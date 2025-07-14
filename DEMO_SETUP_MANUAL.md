# StackFast Demo Setup - Manual Instructions

## 🚨 **If the setup scripts don't work, follow these manual steps:**

### **Option 1: Manual Setup (Recommended)**

1. **Open Terminal/Command Prompt**
   ```bash
   cd "C:\Users\MartinGfX\OneDrive\Documenten\StackFast powered by StackStudio"
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   - Open a new browser window
   - Go to: `http://localhost:3000`
   - **Use incognito/private mode** (important!)

4. **Setup Recording**
   - Download ScreenToGif: https://www.screentogif.com/
   - Set window size to about 1200x800 pixels
   - Close unnecessary tabs and windows

### **Option 2: PowerShell Script**

Run this instead of the .bat file:
```powershell
.\setup-demo.ps1
```

### **Option 3: Step-by-Step Commands**

Open PowerShell and run these one by one:

```powershell
# Navigate to project
cd "C:\Users\MartinGfX\OneDrive\Documenten\StackFast powered by StackStudio"

# Check you're in the right place
dir package.json

# Start dev server (this will keep running)
npm run dev
```

Then in a **new terminal/browser**:
```powershell
# Open browser to your app
start http://localhost:3000
```

## 🎬 **Ready to Record!**

### **Recording Checklist:**
- [ ] Dev server running at http://localhost:3000
- [ ] Browser in incognito/private mode
- [ ] Window size: ~1200x800 pixels
- [ ] ScreenToGif downloaded and ready
- [ ] All other windows closed

### **Quick Demo Flow (15 seconds):**
1. **Show homepage** (SSR instant loading!)
2. **Sign in with GitHub**
3. **Create new blueprint**
4. **Enter project**: "AI-powered SaaS dashboard"
5. **Select skill**: Intermediate
6. **Choose tools**: React, Firebase, Vercel
7. **Generate blueprint** (show AI magic!)
8. **Create GitHub repo**
9. **Show success** and final dashboard

### **ScreenToGif Settings:**
- **Frame Rate**: 15 FPS
- **Recording Area**: Browser window
- **Duration**: 12-15 seconds max
- **Target File Size**: Under 3MB

### **Pro Tips:**
- Practice the flow 2-3 times first
- Smooth, deliberate mouse movements
- Let animations complete before moving on
- Show that instant SSR loading (no blank page!)

## 🚀 **You've Got This!**

The most important thing is showing off your amazing SSR implementation and smooth user experience. Even if the recording isn't perfect on the first try, that's totally normal!

**Quick Start**: Just run `npm run dev`, open http://localhost:3000 in incognito mode, and start recording with ScreenToGif! 🎬
