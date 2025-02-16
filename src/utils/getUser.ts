import type { Universal } from "koishi";
import type { VillaBot } from "../bot";
import type { Member } from "../structs";
import { defineStruct } from "./defineStruct";
import { logger } from "./logger";
import { isBot } from "./isBot";

export async function getUser(
  this: VillaBot,
  userId: string,
  guildId?: string
): Promise<Universal.User> {
  if (isBot(userId)) {
    if (userId === this.id) {
      return {
        username: this.username ?? "",
        nickname: this.nickname ?? "",
        avatar: this.avatar ?? "",
        userId,
        isBot: true,
      };
    }
    logger.warn(
      `Get profile of bot user is not currently support(receive id '${userId}')`
    );
    return {
      userId,
      isBot: true,
    };
  }
  const res = await this.axios.get<Member.Response>(
    "/vila/api/bot/platform/getMember",
    {
      params: defineStruct<Member.Params>({ uid: userId }),
      headers: {
        "x-rpc-villa_id": guildId,
      },
    }
  );

  if (res.retcode !== 0) {
    logger.warn(
      `Failed to get profile of user ${userId}: ${res.message}(${res.retcode})`
    );
  }

  return {
    userId,
    username: res.data.basic.nickname,
    nickname: res.data.basic.nickname,
    avatar: res.data.basic.avatar_url,
    isBot: false,
  };
}
