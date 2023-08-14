import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify, API, Auth, withSSRContext } from "aws-amplify";
import Head from "next/head";
import awsExports from "@/aws-exports";
import { createPost } from "@/graphql/mutations";
import { listPosts } from "@/graphql/queries";
import styles from "../styles/Home.module.css";

Amplify.configure({ ...awsExports, ssr: true });

export async function getServerSideProps({ req }) {
  const SSR = withSSRContext({ req });

  try {
    const response = await SSR.API.graphql({
      query: listPosts,
      authMode: "API_KEY",
    });
    return {
      props: {
        posts: response.data.listPosts.items,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {},
    };
  }
}

async function handleCreatePost(event) {
  event.preventDefault();

  const form = new FormData(event.target);

  try {
    const { data } = await API.graphql({
      authMode: "AMAZON_COGNITO_USER_POOLS",
      query: createPost,
      variables: {
        input: {
          title: form.get("title"),
          content: form.get("content"),
        },
      },
    });

    window.location.href = `/posts/${data.createPost.id}`;
  } catch ({ errors }) {
    console.error(...errors);
    throw new Error(errors[0].message);
  }
}

export default function Home({ posts = [] }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>posters</title>
        <link rel="icon" href="/logo.png" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>POSTER BOARD</h1>

        <p className={styles.description}>
          <code className={styles.code}>{posts.length}</code> posts
        </p>

        <div className={styles.grid}>
          {posts.map((post) => (
            <a className={styles.card} href={`/posts/${post.id}`} key={post.id}>
              <h3>{post.title}</h3>
              <p className={styles.description}>{post.content}</p>
            </a>
          ))}

          <div className={styles.card}>
            <h3 className={styles.title}>New Post</h3>

            <Authenticator>
              <form onSubmit={handleCreatePost}>
                <fieldset>
                  <legend className={styles.myLegend}>Title</legend>
                  <input
                    className={styles.myInput}
                    defaultValue={`Today, ${new Date().toLocaleTimeString()}`}
                    name="title"
                  />
                </fieldset>

                <fieldset>
                  <legend className={styles.myLegend}>Content</legend>
                  <textarea
                    className={styles.myTextarea}
                    defaultValue="I built an Amplify project with Next.js!"
                    name="content"
                  />
                </fieldset>
                <br />
                <button className={styles.myButton}>Create Post</button>
                <button
                  className={styles.myButton}
                  type="button"
                  onClick={() => Auth.signOut()}
                >
                  Sign out
                </button>
              </form>
            </Authenticator>
          </div>
        </div>
      </main>
    </div>
  );
}
