import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus, History, MoreHorizontal, Globe, ArrowUp, Paperclip } from "lucide-react"
import { useChat } from 'ai/react'
import { DEFAULT_MODEL_NAME } from '@/lib/model'
import { toast } from 'sonner'
import { Attachment } from 'ai'
import { PreviewAttachment } from './preview-attachment'
import { Markdown } from './markdown'
import { motion } from 'framer-motion'
import { getInitialMessages } from '@/lib/prompts'

const LoadingDots = () => (
  <div className="flex items-center space-x-1">
    {[0, 1, 2].map((dot) => (
      <motion.div
        key={dot}
        className="w-1.5 h-1.5 bg-gray-600 rounded-full"
        animate={{ y: ["0%", "-50%", "0%"] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: dot * 0.2,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

export function AIAssistant({ className }: { className?: string }) {
  const { messages, handleSubmit, input, setInput, isLoading, append } = useChat({
    body: { 
      id: Date.now().toString(), 
      model: DEFAULT_MODEL_NAME 
    },
    initialMessages: getInitialMessages()
  });
  
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, [input]);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  useEffect(() => {
    // Track when streaming starts (when we get first assistant message while loading)
    if (isLoading && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.content) {
        setIsStreaming(true);
      }
    } else {
      setIsStreaming(false);
    }
  }, [messages, isLoading]);

  useEffect(() => {
    // Scroll to bottom when chat history updates
    chatHistoryRef.current?.scrollTo({ top: chatHistoryRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent newline in textarea
      submitForm();
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/files/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      } else {
        const { error } = await response.json();
        toast.error(error);
      }
    } catch (error) {
      toast.error('Failed to upload file, please try again!');
    }
  };

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments]
  );

  const submitForm = () => {
    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });
    setAttachments([]);
  };

  return (
    <div className={`bg-white ${className}`}>
      <div className="flex items-center justify-between h-12 px-4 border-b">
        <span className="text-[13px] text-gray-700 font-medium">AI Assistant</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:bg-gray-100">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:bg-gray-100">
            <History className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:bg-gray-100">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col h-[calc(100vh-112px)]">
        <div ref={chatHistoryRef} className="flex-1 p-4 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-[13px] text-gray-600">No chat history yet. Ask a question to get started.</p>
          ) : (
            <>
              {messages.filter(message => message.role !== 'system').map((message, index) => (
                <div key={message.id} className="mb-6">
                  {message.role === 'user' ? (
                    <div className="bg-[#F3F4F6] p-3 rounded-md">
                      <p className="text-[13px] text-gray-800">{message.content}</p>
                      {message.experimental_attachments && message.experimental_attachments.length > 0 && (
                        <div className="flex flex-row gap-2 mt-2">
                          {message.experimental_attachments.map((attachment) => (
                            <PreviewAttachment 
                              key={attachment.url} 
                              attachment={attachment}
                              inChat={true}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[13px] text-gray-800 prose prose-sm max-w-none prose-pre:my-0">
                      <Markdown>{message.content as string}</Markdown>
                      {message.experimental_attachments && message.experimental_attachments.length > 0 && (
                        <div className="flex flex-row gap-2 mt-2">
                          {message.experimental_attachments.map((attachment) => (
                            <PreviewAttachment 
                              key={attachment.url} 
                              attachment={attachment}
                              inChat={true}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && !isStreaming && messages[messages.length - 1]?.role === 'user' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-[13px] text-gray-600"
                >
                  <span>AI is thinking</span>
                  <LoadingDots />
                </motion.div>
              )}
            </>
          )}
        </div>
        <div className="p-4 border-t">
          <input
            type="file"
            className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
            ref={fileInputRef}
            multiple
            onChange={handleFileChange}
            tabIndex={-1}
          />
          
          {(attachments.length > 0 || uploadQueue.length > 0) && (
            <div className="flex flex-row gap-2 overflow-x-scroll mb-2">
              {attachments.map((attachment) => (
                <PreviewAttachment key={attachment.url} attachment={attachment} />
              ))}

              {uploadQueue.map((filename) => (
                <PreviewAttachment
                  key={filename}
                  attachment={{
                    url: '',
                    name: filename,
                    contentType: '',
                  }}
                  isUploading={true}
                />
              ))}
            </div>
          )}

          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder="Ask for assistance with your tender..."
              className="w-full min-h-[96px] text-[13px] bg-[#F3F4F6] rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder-gray-500"
              style={{ paddingTop: '0.75rem', paddingBottom: '2.75rem', paddingLeft: '0.75rem', paddingRight: '0.75rem' }}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <div className="absolute left-0 right-0 bottom-0 flex items-center justify-between p-2 bg-[#F3F4F6] rounded-b-lg">
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 hover:bg-gray-200"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <Paperclip className="h-4 w-4 text-gray-400" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-gray-200">
                  <Globe className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={submitForm}
                className="h-7 w-7 hover:bg-gray-200"
                disabled={isLoading || uploadQueue.length > 0}
              >
                <ArrowUp className="h-4 w-4 text-gray-400" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

