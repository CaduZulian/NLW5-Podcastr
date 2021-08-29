import { GetStaticPaths, GetStaticProps } from 'next';
import {useRouter} from 'next/router'
import { api } from '../../services/api';
import {format, parseISO} from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';
import Link from "next/link"

import styles from "./episode.module.scss"
import Image from "next/image"
import { usePlayer } from '../../contexts/playerContext';
import Head from 'next/head';

type Episode = {
  id: string;
  title: string;
  members: string;
  thumbnail: string;
  duration: number;
  durationAtString: string;
  url: string;
  publishedAt: string;
  description: string;
};

type episodeProps = {
  episode: Episode
};

export default function Episode({episode}: episodeProps){
  const { play } = usePlayer();

const router = useRouter();

  return(
    <div className={styles.episode}>
      <Head>
        <title>{episode.title} | Podcastr</title>
      </Head>
      <div className={styles.thumbnailContainer}>
        <Link href="/">
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar"/>
          </button>
        </Link>
        <Image 
          width={700} 
          height={160} 
          src={episode.thumbnail} 
          objectFit='cover' 
        /> 
        <button type="button" onClick={()=> play(episode)}>
          <img src="/play.svg" alt="Tocar episódio" />
        </button>
      </div>
      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAtString}</span>
      </header>
      <div className={styles.description} dangerouslySetInnerHTML={{__html: episode.description}} />
        
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 2,
      _sort: 'published_at',
      _order: 'desc'
    }
  })
  
  const paths = data.map(episode => {
    return {
      params: {
        Slug: episode.id
      }
    }
  })
  
  
  return{
    paths,
    fallback: "blocking",
  }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { Slug } = ctx.params;

  const {data} = await api.get(`/episodes/${Slug}`)

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', {locale: ptBR}),
    duration: Number(data.file.duration),
    durationAtString: convertDurationToTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url,
  }

  return {
    props:{
      episode
    },
    revalidate: 60 * 60 * 24, //24 hours
  }

}   