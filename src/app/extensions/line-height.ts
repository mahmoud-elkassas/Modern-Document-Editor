import { Extension } from '@tiptap/core';

export const LineHeightExtension = Extension.create({
  name: 'lineHeight',

  addOptions() {
    return {
      types: ['paragraph'],
      defaultLineHeight: 'normal',
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: this.options.defaultLineHeight,
            parseHTML: element => element.style.lineHeight,
            renderHTML: attributes => {
              if (!attributes.lineHeight) {
                return {};
              }
              return {
                style: `line-height: ${attributes.lineHeight}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight: (lineHeight: string) => ({ commands }) => {
        return this.options.types.every(type =>
          commands.updateAttributes(type, { lineHeight })
        );
      },
      unsetLineHeight: () => ({ commands }) => {
        return this.options.types.every(type =>
          commands.resetAttributes(type, 'lineHeight')
        );
      },
    };
  },
});