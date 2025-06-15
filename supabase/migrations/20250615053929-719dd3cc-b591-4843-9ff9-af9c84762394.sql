
-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true);

-- Create RLS policies for the documents bucket
CREATE POLICY "Users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their documents" ON storage.objects
FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their documents" ON storage.objects
FOR UPDATE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their documents" ON storage.objects
FOR DELETE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add RLS policies for documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view documents for their APIs" ON documents
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM apis 
    WHERE apis.id = documents.api_id 
    AND apis.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert documents for their APIs" ON documents
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM apis 
    WHERE apis.id = documents.api_id 
    AND apis.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update documents for their APIs" ON documents
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM apis 
    WHERE apis.id = documents.api_id 
    AND apis.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete documents for their APIs" ON documents
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM apis 
    WHERE apis.id = documents.api_id 
    AND apis.user_id = auth.uid()
  )
);

-- Enable realtime for documents table
ALTER TABLE documents REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE documents;
