import * as React from 'react';
import classNames from 'classnames';
export interface BlockProps {
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  grayBg?: boolean;
  lightBg?: boolean;
  padding?: boolean;
  style?: React.CSSProperties;
}

const Frame = (props: BlockProps) => {
  const { title, children, className = '', grayBg, lightBg, padding, style } = props;
  let backgroundColor = '#FDFFFD';
  if (grayBg) {
    backgroundColor = '#F2F2F2';
  }
  if (lightBg) {
    backgroundColor = '#F7F7F7';
  }
  return (
    <div
      className={classNames({
        [className]: true,
        'padding': padding,
      })}
      style={{
        margin: '0 auto',
        ...style,
        backgroundColor,
      }}
    >
      {title ? <div>{title}</div> : null}
      <div>{children}</div>
    </div>
  );
};
export default Frame;
