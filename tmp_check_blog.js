const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://nmnhppigarhbimklkjal.supabase.co';
const supabaseKey = 'sb_publishable_QxXb7Z5uLSSaXE3jyd8zcQ_h6Uix7Tx';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBlogPosts() {
  const { error } = await supabase.from('blog_posts').select('*').limit(1);
  if (error) {
    console.log('BLOG_POSTS_ERROR:' + error.message);
  } else {
    console.log('BLOG_POSTS_EXIST: TRUE');
  }
}
checkBlogPosts();
