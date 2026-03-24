import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { useRef } from 'react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Undo,
  Redo,
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  minHeight = '240px',
}: RichTextEditorProps) {
  const initializedRef = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Underline,
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onCreate: () => {
      initializedRef.current = true
    },
  })

  if (!editor) return null

  function setLink() {
    const url = prompt('Enter URL:')
    if (!url) return
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
      `}</style>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 p-1.5 border-b border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded p-1.5 text-gray-700 hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded p-1.5 text-gray-700 hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`rounded p-1.5 text-gray-700 hover:bg-gray-100 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>

        <div className="h-5 w-px bg-gray-200 mx-1 self-center" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`rounded p-1.5 text-gray-700 hover:bg-gray-100 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`rounded p-1.5 text-gray-700 hover:bg-gray-100 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="h-5 w-px bg-gray-200 mx-1 self-center" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded p-1.5 text-gray-700 hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded p-1.5 text-gray-700 hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`rounded p-1.5 text-gray-700 hover:bg-gray-100 ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </button>

        <div className="h-5 w-px bg-gray-200 mx-1 self-center" />

        <button
          type="button"
          onClick={setLink}
          className={`rounded p-1.5 text-gray-700 hover:bg-gray-100 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
          title="Insert Link"
        >
          <Link2 className="h-4 w-4" />
        </button>

        <div className="h-5 w-px bg-gray-200 mx-1 self-center" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="rounded p-1.5 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="rounded p-1.5 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <div style={{ minHeight }} className="px-4 py-3">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none focus:outline-none"
        />
      </div>
    </div>
  )
}
