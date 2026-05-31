interface UserAvatarProps {
  avatarUrl: string | null;
  username: string;
  size?: number;
}

export function UserAvatar({
  avatarUrl,
  username,
  size = 40,
}: UserAvatarProps) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt={username} width={size} height={size} />;
  }

  return <div>{username[0]?.toUpperCase()}</div>;
}
