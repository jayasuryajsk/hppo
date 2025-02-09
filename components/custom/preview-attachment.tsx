import { Attachment } from 'ai';
import { FileIcon, ImageIcon, LoaderIcon, PdfIcon } from './icons';

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
  inChat = false,
}: {
  attachment: Attachment;
  isUploading?: boolean;
  inChat?: boolean;
}) => {
  const { name, url, contentType } = attachment;

  const getFileIcon = () => {
    if (!contentType) return <FileIcon />;
    if (contentType.startsWith('image')) return <ImageIcon />;
    if (contentType === 'application/pdf') return <PdfIcon />;
    return <FileIcon />;
  };

  const containerClasses = inChat 
    ? "flex items-center gap-2 p-2 bg-muted rounded-md max-w-sm" 
    : "flex flex-col gap-2 max-w-16";

  const previewClasses = inChat
    ? "w-8 h-8 bg-background rounded-md relative flex items-center justify-center"
    : "w-20 aspect-video bg-muted rounded-md relative flex flex-col items-center justify-center";

  return (
    <div className={containerClasses}>
      <div className={previewClasses}>
        {contentType ? (
          contentType.startsWith('image') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={name ?? 'An image attachment'}
              className={inChat ? "rounded-md size-full object-cover" : "rounded-md size-full object-cover"}
            />
          ) : (
            <div className="text-muted-foreground">
              {getFileIcon()}
            </div>
          )
        ) : (
          <div className="text-muted-foreground">
            {getFileIcon()}
          </div>
        )}

        {isUploading && (
          <div className="animate-spin absolute text-zinc-500">
            <LoaderIcon />
          </div>
        )}
      </div>
      <div className={inChat ? "text-sm flex-1 truncate" : "text-xs text-zinc-500 max-w-16 truncate"}>
        {name}
      </div>
      {inChat && contentType === 'application/pdf' && (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline ml-auto"
        >
          View PDF
        </a>
      )}
    </div>
  );
};
