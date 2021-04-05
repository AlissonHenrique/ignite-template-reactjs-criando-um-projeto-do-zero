import { GetStaticPaths, GetStaticProps } from 'next';
import PrismicDOM, { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';
import Header from '../../components/Header';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();
  const timer = useMemo(() => {
    const mediaTimer = 200;

    const words = post.data.content.reduce((accumulator, currentValue) => {
      const wordsHeading = currentValue.heading.split(/\s/g).length;

      const wordsBody = currentValue.body.reduce(
        (summedBodies, currentBody) => {
          const textWords = currentBody.text.split(/\s/g).length;

          return summedBodies + textWords;
        },
        0
      );
      return accumulator + wordsHeading + wordsBody;
    }, 0);

    const minutes = Math.ceil(words / mediaTimer);
    return minutes;
  }, [post]);

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }
  return (
    <>
      <Header />
      <div className={styles.container}>
        <img src={post.data.banner.url} alt={post.data.title} />
        <div className={styles.content}>
          <h1>{post.data.title} </h1>
          <div className={styles.containerIcons}>
            <div>
              <FiCalendar color="#bbbbbb" size={20} />
              <p>
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </p>
            </div>
            <div>
              <FiUser color="#bbbbbb" size={20} />
              <p>{post.data.author}</p>
            </div>
            <div>
              <FiClock color="#bbbbbb" size={20} />
              <p>{timer} min</p>
            </div>
          </div>

          {post.data.content.map(item => (
            <div className="body" key={item.heading}>
              <h2>{item.heading}</h2>
              <div
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: PrismicDOM.RichText.asHtml(item.body),
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// export const getStaticPaths = async () => {
//   const prismic = getPrismicClient();
//   const posts = await prismic.query(TODO);

//   // TODO
// };

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();

  const post = await prismic.getByUID('posts', String(slug), {});

  return {
    props: { post },
    redirect: 60 * 30,
  };
};
