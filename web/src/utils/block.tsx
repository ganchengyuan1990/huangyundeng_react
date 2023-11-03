import * as React from 'react';
import classNames from 'classnames';

export interface BlockProps {
  title?: React.ReactNode;
  children?: React.ReactNode;
  noTitlePadding?: boolean;
  contentStyle?: React.CSSProperties;
  className?: string;
  padding?: boolean;
  style?: React.CSSProperties;
}
const Block = (props: BlockProps) => {
  const { title, children, noTitlePadding, contentStyle, className, padding, style } = props;
  return (
    <div
      className={classNames({
        [className || '']: true,
        'padding': padding,
      })}
      style={style}>
      <div style={{ paddingLeft: noTitlePadding ? '0' : '2.4rem', textAlign: 'left', fontSize: 22 }}>
        {title}
      </div>
      <div style={contentStyle}>
        {children}
      </div>
    </div>
  );
};
export default Block;
