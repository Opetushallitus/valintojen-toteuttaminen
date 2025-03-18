'use client';
import React, {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
} from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { ophColors, styled } from '@/lib/theme';

/**
 * Properties for the Editor component.
 *
 * @property {string} editorContent - The content to be displayed in the editor.
 * @property {function} onContentChanged - Callback function that is called when the content changes in the editor.
 *
 */
export type EditorProps = {
  editorContent: string;
  onContentChanged: (value: string) => void;
};

const EDITOR_BORDER = `1px solid ${ophColors.black}`;

const StyledEditor = styled('div')({
  '& .ql-container': {
    fontFamily: 'Open Sans',
  },
  border: `${EDITOR_BORDER} !important`,
  borderRadius: '2px',
  '& .ql-toolbar': {
    border: 'none !important',
    borderBottom: `${EDITOR_BORDER} !important`,
  },
});

// Editor is an uncontrolled React component
const QuillEditor = forwardRef<Quill, EditorProps>(
  ({ editorContent, onContentChanged }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef(editorContent);
    const contentChangedRef = useRef(onContentChanged);

    useLayoutEffect(() => {
      contentChangedRef.current = onContentChanged;
    });

    useEffect(() => {
      const container = containerRef.current;
      if (container && ref) {
        const editorContainer = container.appendChild(
          container.ownerDocument.createElement('div'),
        );
        const quill = new Quill(editorContainer, {
          bounds: container,
          theme: 'snow',
        });

        if (typeof ref === 'function') {
          ref(quill);
        } else {
          ref.current = quill;
        }

        if (contentRef.current) {
          const delta = quill.clipboard.convert({
            html: contentRef.current,
          });
          quill.setContents(delta);
        }

        quill.on(Quill.events.TEXT_CHANGE, () => {
          const semanticHTML = quill
            .getSemanticHTML()
            .replaceAll('&nbsp;', ' ')
            // poistetaan tyhjä tekstikappale alusta
            .replace(/^<p><\/p>/g, '');
          contentChangedRef?.current?.(semanticHTML);
        });
        return () => {
          if (typeof ref === 'function') {
            ref(null);
          } else {
            ref.current = null;
          }
          container.innerHTML = '';
        };
      }
    }, [ref]);

    const id = useId();
    const editorId = `oph-editor-${id}`;

    return <StyledEditor id={editorId} ref={containerRef} spellCheck={false} />;
  },
);

QuillEditor.displayName = 'OphEditor';

export const OphEditor = ({ editorContent, onContentChanged }: EditorProps) => {
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    const quill = quillRef.current;
    if (quill instanceof Quill) {
      const delta = quill.clipboard.convert({ html: editorContent });
      quill.setContents(delta);
    }
  }, [editorContent]);

  return (
    <QuillEditor
      ref={quillRef}
      editorContent={editorContent}
      onContentChanged={onContentChanged}
    />
  );
};
