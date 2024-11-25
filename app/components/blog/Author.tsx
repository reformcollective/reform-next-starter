import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

type Nullish = null | undefined;

export type AuthorInfo =
  | {
      fullName: string | Nullish;
      roleAndCompany: string | Nullish;
      photo: string;
      slug: {
        current: string;
      };
    }
  | Nullish;

export function Author({ author }: { author: AuthorInfo }) {
  if (!author) return null;
  return (
    <Link href={`/blog/author/${author.slug.current}`}>
      <Image src={author?.photo} alt={author?.fullName ?? ""} />
      {author?.fullName}
      <br />
      {author?.roleAndCompany}
    </Link>
  );
}

const AuthorImage = styled(Image)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  float: left;
`;
