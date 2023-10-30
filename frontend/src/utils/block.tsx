import * as React from 'react';
import { View } from 'remax/one';
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
    <View
      className={classNames({
        [className]: true,
        'padding': padding,
      })}
      style={style}>
      <View style={{ paddingLeft: noTitlePadding ? '0' : '24px' }}>
        {title}
      </View>
      <View style={contentStyle}>
        {children}
      </View>
    </View>
  );
};
export default Block;
