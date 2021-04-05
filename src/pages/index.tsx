import Link from 'next/link';
import { GetStaticProps } from 'next';
import { format } from 'date-fns';
import Prismic from '@prismicio/client';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';
import stylesHeader from '../components/Header/header.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [hasMostPost, setHasMostPost] = useState(postsPagination.next_page);

  async function handleLoadPosts() {
    const response = await fetch(postsPagination.next_page).then(resp =>
      resp.json()
    );
    setPosts([...posts, ...response.results]);
    setHasMostPost(response.next_page);
  }

  return (
    <>
      <header className={stylesHeader.headerContainer}>
        <div className={stylesHeader.heraderContent}>
          <img src="/logo.svg" alt="logo" />
        </div>
      </header>
      <div className={styles.container}>
        <div className={styles.content}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <div className={styles.card}>
                <h1> {post.data.title}</h1>
                <p>{post.data.subtitle}</p>

                <div className={styles.containerIcons}>
                  <div>
                    <FiCalendar color="#bbbbbb" size={20} />
                    <p>
                      {format(
                        new Date(post.first_publication_date),
                        'dd MMM yyyy',
                        {
                          locale: ptBR,
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <FiUser color="#bbbbbb" size={20} />
                    <p>{post.data.author}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {hasMostPost && (
            <button
              type="button"
              title="Carregar mais posts"
              onClick={handleLoadPosts}
              className={styles.more}
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const prismic = getPrismicClient();
  const postsPagination = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
    }
  );

  return {
    props: { postsPagination },
  };
};
