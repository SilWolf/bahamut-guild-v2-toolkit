// const itemDiv = document.createElement('div')
// itemDiv.classList.add('c-reply__item')
// itemDiv.classList.add('bhgv2-comment')
// itemDiv.setAttribute('data-csn', comment.id)

// const avatarDiv = document.createElement('div')
// avatarDiv.classList.add('reply-avatar')

// const avatarImgA = document.createElement('a')
// avatarImgA.classList.add('reply-avatar-img')
// avatarImgA.setAttribute(
// 	'href',
// 	`https://home.gamer.com.tw/${comment.userid}`
// )
// avatarImgA.setAttribute('target', '_blank')
// avatarDiv.append(avatarImgA)

// const avatarImg = document.createElement('img')
// avatarImg.classList.add('gamercard')
// avatarImg.setAttribute('data-src', comment.propic)
// avatarImg.setAttribute('data-gamercard-userid', comment.userid)
// avatarImgA.append(avatarImg)

// const contentDiv = document.createElement('div')
// contentDiv.classList.add('reply-content')

// const contentUser = document.createElement('a')
// contentUser.classList.add('reply-content__user')
// contentUser.setAttribute(
// 	'href',
// 	`https://home.gamer.com.tw/${comment.userid}`
// )
// contentUser.setAttribute('target', '_blank')
// contentUser.innerHTML = comment.name

// const contentRight = document.createElement('div')
// contentRight.classList.add('reply-right')

// const contentRightPosition = document.createElement('span')
// contentRightPosition.classList.add('reply_time')
// contentRightPosition.classList.add('reply_position')
// contentRightPosition.innerHTML = `#${comment.position}`

// const contentRightCTime = document.createElement('span')
// contentRightCTime.classList.add('reply_time')
// contentRightCTime.classList.add('reply_ctime')
// contentUser.setAttribute('data-ctime', comment.ctime)
// contentRightCTime.innerHTML = `#${comment.time}`

// const contentRightMenu = document.createElement('a')
// contentRightMenu.classList.add('reply_menu')
// contentRightMenu.setAttribute('href', '#')

// contentRight.append(contentRightPosition, contentRightCTime, contentRightMenu)

// const contentArticle = document.createElement('article')

// const itemDiv = $(`
// <div class="c-reply__item bhgv2-comment" data-csn="${comment.id}">
//   <div class="reply-avatar">
//     <a class="reply-avatar-img" href="https://home.gamer.com.tw/${comment.userid}" target="_blank"><img data-src="${comment.propic}" data-gamercard-userid="${comment.userid}" class="gamercard"></a>
//   </div>
//   <div class="reply-content">
//     <a class="reply-content__user" href="https://home.gamer.com.tw/${comment.userid}" target="_blank">${comment.name}</a>
//     <div class="reply_right">
//       <span class="reply_time reply-position">#${comment.position}</span>
//       <span class="reply_time reply-ctime" data-ctime="${comment.ctime}">${comment.time}</span>
//       <a class="reply_menu" href="javascript:;"></a>
//     </div>
//     <article class="reply-content__cont">
//       <p><br>「就算無法抵擋四災，預言中也說要直面面對。<br>　這是我直面面對的證明，我的血肉都要成為對抗四災的貢獻，<br>　參與義勇軍，就必須要有覺悟，<br>　那麼，在化成砂之前，至少我能夠說，降下四災、損毀我親友的神是錯誤的。<br>　我是應該活在世界上的，因為我很多支持我的人──啊，雖然目前似乎是辦不到了。」</p>

//     </article>
//     <div class="reply-content__footer">
//       <button class="reply-content__tag" type="button" onclick="GuildComment.replyUser(this, '${comment.userid}', '${comment.name}')">回覆</button>
//       <div class="reply-content__gpbp">
//           <button class="reply-content__gp" type="button">
//             <div class="gb-img" onclick="GuildComment.commentGpBp(${gsn}, ${sn}, ${comment.id}, 1);"></div>
//             <span>0</span>
//           </button>
//           <button class="reply-content__bp" type="button">
//             <div class="gb-img" onclick="GuildComment.commentGpBp(${gsn}, ${sn}, ${comment.id}, 2);"></div>
//             <span>0</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>
// `)
