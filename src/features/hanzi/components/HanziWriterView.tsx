import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { WebView } from "react-native-webview";
import { COLORS } from "@/constants";

interface HanziWriterViewProps {
  character: string;
  width?: number;
  height?: number;
  showOutline?: boolean;
  strokeAnimationSpeed?: number;
  delayBetweenStrokes?: number;
  autoAnimate?: boolean;
  quizMode?: boolean;
  onComplete?: () => void;
  onCorrectStroke?: () => void;
  onMistake?: () => void;
}

export function HanziWriterView({
  character,
  width = 200,
  height = 200,
  showOutline = true,
  strokeAnimationSpeed = 1,
  delayBetweenStrokes = 300,
  autoAnimate = true,
  quizMode = false,
  onComplete,
  onCorrectStroke,
  onMistake,
}: HanziWriterViewProps) {
  const webViewRef = useRef<WebView>(null);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://cdn.jsdelivr.net/npm/hanzi-writer@3.5/dist/hanzi-writer.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      background-color: ${COLORS.surface}; 
      display: flex; 
      justify-content: center; 
      align-items: center;
      min-height: 100vh;
    }
    #character-target {
      border: 2px solid ${COLORS.border};
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div id="character-target"></div>
  <script>
    const character = "${character}";
    const isQuizMode = ${quizMode};
    
    const writer = HanziWriter.create('character-target', character, {
      width: ${width},
      height: ${height},
      padding: 10,
      showOutline: ${showOutline},
      strokeAnimationSpeed: ${strokeAnimationSpeed},
      delayBetweenStrokes: ${delayBetweenStrokes},
      strokeColor: '#e94560',
      outlineColor: '#2a2a4e',
      radicalColor: '#0f3460',
      drawingColor: '#4ade80',
    });

    if (isQuizMode) {
      writer.quiz({
        onComplete: function(summaryData) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'complete', data: summaryData }));
        },
        onCorrectStroke: function(strokeData) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'correctStroke', data: strokeData }));
        },
        onMistake: function(strokeData) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mistake', data: strokeData }));
        }
      });
    } else if (${autoAnimate}) {
      writer.animateCharacter({
        onComplete: function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'complete' }));
        }
      });
    }

    // Listen for commands from React Native
    document.addEventListener('message', function(e) {
      const message = JSON.parse(e.data);
      if (message.command === 'animate') {
        writer.animateCharacter();
      } else if (message.command === 'quiz') {
        writer.quiz();
      } else if (message.command === 'reset') {
        writer.cancelQuiz();
        writer.hideCharacter();
        writer.quiz();
      }
    });
  </script>
</body>
</html>
  `;

  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      switch (message.type) {
        case "complete":
          onComplete?.();
          break;
        case "correctStroke":
          onCorrectStroke?.();
          break;
        case "mistake":
          onMistake?.();
          break;
      }
    } catch (e) {
      console.error("Error parsing WebView message:", e);
    }
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 8,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
