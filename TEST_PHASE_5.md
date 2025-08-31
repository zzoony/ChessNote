# Phase 5 Testing Guide

## Quick Test Commands

### 1. Start Development Server
```bash
cd /Users/peter/Dev/ChessNote
npx expo start --port 8081
```

### 2. Run on iOS Simulator  
```bash
npx expo run:ios --device "iPhone 16 Pro"
```

### 3. TypeScript Check
```bash
npx tsc --noEmit
```

## Testing Checklist

### ✅ Theme System
- [ ] Launch app - should show classic theme by default
- [ ] Navigate to Settings (⚙️ icon in top right)
- [ ] Change app theme: Classic → Light → Dark → Classic
- [ ] Change board theme: Classic → Modern → Wooden → Marble
- [ ] Verify colors update immediately
- [ ] Exit and restart app - settings should persist

### ✅ Settings Interface
- [ ] All setting sections expand/collapse properly
- [ ] Theme options show current selection
- [ ] Toggle switches work (Animations, Sound, Haptic)
- [ ] Language selector works (Korean/English)
- [ ] Reset settings shows confirmation dialog
- [ ] Back button returns to main menu

### ✅ Performance Features  
- [ ] Smooth scrolling in settings
- [ ] No lag when changing themes
- [ ] Chessboard renders smoothly
- [ ] Game notation updates without delay
- [ ] Loading states appear appropriately

### ✅ Haptic Feedback (iOS only)
- [ ] Light feedback on setting changes
- [ ] Medium feedback on piece moves
- [ ] Heavy feedback on captures
- [ ] Warning feedback on check
- [ ] Error feedback on checkmate
- [ ] Can be disabled in settings

### ✅ Visual Polish
- [ ] Status bar color matches theme
- [ ] Navigation headers use theme colors
- [ ] All text is readable in all themes
- [ ] Board coordinates visible in all board themes
- [ ] Game notation styling consistent

### ✅ Integration Test
- [ ] Start new game from main menu
- [ ] Make several moves - verify haptic feedback
- [ ] Go to Settings, change theme
- [ ] Return to game - verify theme applied
- [ ] Game state preserved correctly
- [ ] Settings persist after app restart

## Known Limitations

1. **Haptic Feedback**: Only works on iOS devices (not simulator)
2. **Sound Effects**: Implementation placeholder (not yet functional)
3. **Custom Board Themes**: Limited to predefined options
4. **Animations**: Basic implementation (no complex transitions)

## Performance Expectations

- **Startup Time**: <2 seconds on iPhone 16 Pro simulator
- **Theme Switching**: Instant visual feedback
- **Settings Load**: <1 second from AsyncStorage
- **Memory Usage**: Stable, no leaks observed
- **Frame Rate**: 60fps maintained during interactions

## Troubleshooting

### If app doesn't start:
```bash
npx expo install --fix
npm install
npx expo start --clear
```

### If themes don't persist:
- Check AsyncStorage permissions
- Clear app data and test fresh install
- Verify settings.json is being saved

### If haptic feedback doesn't work:
- Test on physical iOS device (not simulator)
- Check device haptic settings
- Verify expo-haptics is properly installed

## Success Criteria

✅ **Phase 5 Complete** when:
1. All 3 app themes work correctly
2. All 4 board themes display properly  
3. Settings screen fully functional
4. Performance optimizations measurable
5. Haptic feedback integrated (iOS)
6. No TypeScript errors
7. Smooth user experience throughout
8. Settings persist between sessions

---

**Ready for Phase 6**: Advanced gameplay features and final polish