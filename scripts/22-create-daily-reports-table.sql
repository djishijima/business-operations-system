-- 日報テーブルの作成
CREATE TABLE IF NOT EXISTS daily_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLSを有効化
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- ポリシーの作成
CREATE POLICY "Users can view their own daily reports" ON daily_reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily reports" ON daily_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily reports" ON daily_reports
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily reports" ON daily_reports
    FOR DELETE USING (auth.uid() = user_id);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_daily_reports_user_id ON daily_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_project_id ON daily_reports(project_id);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_daily_reports_updated_at BEFORE UPDATE
    ON daily_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
