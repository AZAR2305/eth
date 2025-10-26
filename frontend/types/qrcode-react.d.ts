declare module 'qrcode.react' {
  import React from 'react';
  export const QRCodeSVG: React.FC<{
    value: string;
    size?: number;
    bgColor?: string;
    fgColor?: string;
    level?: 'L' | 'M' | 'Q' | 'H';
    includeMargin?: boolean;
    imageSettings?: any;
    style?: React.CSSProperties;
    className?: string;
  }>;
  export default QRCodeSVG;
}
