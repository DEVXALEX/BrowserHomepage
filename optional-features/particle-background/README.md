# Particle Background Animation - Optional Feature

## 📦 What This Is
An interactive particle background effect similar to Google Antigravity, where blue particles float across the screen and react to your mouse cursor.

## ✨ Features
- **Always Visible**: Particles scattered across the entire screen
- **Gentle Floating**: Particles slowly drift around
- **Mouse Interaction**: Particles grow bigger and brighter when mouse is near
- **Smooth Animations**: All transitions are smooth and fluid
- **Performance Optimized**: 60fps with minimal CPU usage

## 🚀 How to Enable

### Step 1: Copy the JavaScript File
Copy `particles.js` from this folder to:
```
m:/BrowserHomepage-main/js/modules/particles.js
```

### Step 2: Add Canvas to HTML
Open `index.html` and add this right after `<body>`:
```html
<body>

    <!-- Particle Background Canvas -->
    <canvas id="particle-canvas"></canvas>
```

### Step 3: Add CSS Styling
Open `style.css` and add this after the body styles:
```css
/* Particle Background Canvas */
#particle-canvas {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
}
```

### Step 4: Add Script Tag
Open `index.html` and add this script tag before `</body>`:
```html
    <script src="js/modules/particles.js"></script>
    <script src="js/modules/settings.js"></script>
    <script src="js/main.js"></script>
</body>
```

### Step 5: Initialize in main.js
Open `js/main.js` and add this line with the other initializations:
```javascript
if (app.initParticles) app.initParticles();
```

## 🎨 Customization

You can customize the particle effect by editing `particles.js`:

### Change Particle Color
Line 51: Change the RGB values
```javascript
ctx.fillStyle = `rgba(100, 149, 237, ${this.opacity})`; // Blue
// Try: rgba(255, 100, 100, ...) for red
// Try: rgba(100, 255, 100, ...) for green
```

### Adjust Particle Count
Line 116: Change the divisor (lower = more particles)
```javascript
let numberOfParticles = (canvas.width * canvas.height) / 6000;
// Try: / 4000 for more particles
// Try: / 10000 for fewer particles
```

### Change Interaction Radius
Line 8: Adjust the radius value
```javascript
let mouse = { x: -1000, y: -1000, radius: 200 };
// Try: radius: 300 for larger interaction area
// Try: radius: 100 for smaller interaction area
```

### Adjust Growth Size
Line 95: Change the multiplier
```javascript
this.size = this.baseSize + (proximityFactor * 8);
// Try: * 12 for larger growth
// Try: * 4 for smaller growth
```

## 🔧 Troubleshooting

**Particles not showing?**
- Check browser console for errors (F12)
- Verify canvas element exists in HTML
- Ensure CSS z-index is set correctly

**Performance issues?**
- Reduce particle count (increase divisor in line 116)
- Reduce interaction radius
- Disable glow effect (comment out lines 56-61)

## 📝 Notes
- This feature is optional and not enabled by default
- Particles are positioned behind all content (z-index: -1)
- Works on all modern browsers
- Mobile-friendly and responsive

Enjoy your interactive particle background! ✨
