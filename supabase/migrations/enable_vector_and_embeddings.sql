-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Add embedding column to notes table
-- 1536 dimensions is for OpenAI's text-embedding-3-small model
alter table notes add column if not exists embedding vector(1536);

-- Add embedding column to knowledge_articles table
alter table knowledge_articles add column if not exists embedding vector(1536);

-- Create an index for faster similarity search (IVFFlat)
-- Note: It's often recommended to create this after you have some data, 
-- but we can create it now. Lists = rows / 1000 is a rule of thumb.
-- We'll skip the index for now to avoid errors on empty tables and add it later if needed.

-- Create a function to search for notes
create or replace function match_notes (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  title text,
  similarity float
)
language plpgsql
as $$
begin
  return query(
    select
      notes.id,
      notes.content,
      notes.title,
      1 - (notes.embedding <=> query_embedding) as similarity
    from notes
    where 1 - (notes.embedding <=> query_embedding) > match_threshold
    order by notes.embedding <=> query_embedding
    limit match_count
  );
end;
$$;

-- Create a function to search for articles
create or replace function match_articles (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  title text,
  similarity float
)
language plpgsql
as $$
begin
  return query(
    select
      knowledge_articles.id,
      knowledge_articles.content,
      knowledge_articles.title,
      1 - (knowledge_articles.embedding <=> query_embedding) as similarity
    from knowledge_articles
    where 1 - (knowledge_articles.embedding <=> query_embedding) > match_threshold
    order by knowledge_articles.embedding <=> query_embedding
    limit match_count
  );
end;
$$;
