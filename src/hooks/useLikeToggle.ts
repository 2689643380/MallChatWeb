import { computed } from 'vue'
import apis from '@/services/apis'
import { ActType, MarkType, IsYet } from '@/services/types'
import type { MessageItemType } from '@/services/types'

/**
 * 统一点赞倒赞操作Hook
 * @param message 消息
 * @description 引入该Hook后，可直接使用isLike(是否已点赞)、isDisLike(是否已倒赞)、onLike(点赞方法)、onDisLike(倒赞方法)
 */
export const useLikeToggle = (message: MessageItemType['message']) => {
  const isLike = computed(() => message.messageMark.userLike === IsYet.Yes)
  const isDisLike = computed(() => message.messageMark.userDislike === IsYet.Yes)
  const likeCount = computed(() => message.messageMark.likeCount)
  const dislikeCount = computed(() => message.messageMark.dislikeCount)

  /**
   * 点赞\取消点赞
   * @description 根据是否已经点赞控制更新点赞状态
   */
  const onLike = async () => {
    const actType = isLike.value ? ActType.Cancel : ActType.Confirm
    await apis.markMsg({ actType, markType: MarkType.Like, msgId: message.id }).send()

    // 根据actType类型去更新本地点赞状态-点赞数
    const { likeCount } = message.messageMark
    const isConfirm = actType === ActType.Confirm
    message.messageMark.userLike = isConfirm ? IsYet.Yes : IsYet.No
    message.messageMark.likeCount = isConfirm ? likeCount + 1 : likeCount - 1
    // 互斥操作
    if (isDisLike.value) {
      message.messageMark.userDislike = IsYet.No
      message.messageMark.dislikeCount = dislikeCount.value - 1
    }
  }

  /**
   * 倒赞\取消倒赞
   * @description 根据是否已经倒赞控制更新倒赞状态
   */
  const onDisLike = async () => {
    const actType = isDisLike.value ? ActType.Cancel : ActType.Confirm
    await apis.markMsg({ actType, markType: MarkType.DisLike, msgId: message.id }).send()

    // 根据actType类型去更新本地倒赞状态-倒赞数
    const { dislikeCount } = message.messageMark
    const isConfirm = actType === ActType.Confirm
    message.messageMark.userDislike = isConfirm ? IsYet.Yes : IsYet.No
    message.messageMark.dislikeCount = isConfirm ? dislikeCount + 1 : dislikeCount - 1
    // 互斥操作
    if (isLike.value) {
      message.messageMark.userLike = IsYet.No
      message.messageMark.likeCount = likeCount.value - 1
    }
  }

  return {
    isLike,
    isDisLike,
    likeCount,
    dislikeCount,
    onLike,
    onDisLike,
  }
}

export default useLikeToggle
