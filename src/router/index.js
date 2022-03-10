import {
	createRouter,
	createWebHashHistory
}
from 'vue-router'
import Login from '../views/login.vue'
import Main from "../views/main.vue"
import Home from "../views/home.vue"
import Role from "../views/role.vue"
import User from "../views/user.vue"
import Dept from "../views/dept.vue"
import MeetingRoom from '../views/meeting_room.vue'
import OfflineMeeting from "../views/offline_meeting.vue"
import OnlineMeeting from "../views/online_meeting.vue"
import MeetingVideo from "../views/meeting_video.vue"
import Approval from "../views/approval.vue"
import Leave from "../views/leave.vue"
import Reim from "../views/reim.vue"
import NotFound from "../views/404.vue"


const routes = [{
		path: '/login',
		name: 'Login',
		component: Login
	},
	{
		path: '/',
		name: 'Main',
		component: Main,
		children: [{
				path: '/home',
				name: 'Home',
				component: Home,
				meta: {
					title: 'ホームページ',
				}
			},
			{
				path: "/role",
				name: "Role",
				component: Role,
				meta: {
					title: "役割管理",
					isTab: true
				}
			},
			{
				path: '/user',
				name: 'User',
				component: User,
				meta: {
					title: 'ユーザー管理',
					isTab: true
				}
			},
			{
				path: '/dept',
				name: 'Dept',
				component: Dept,
				meta: {
					title: '部門管理',
					isTab: true
				}
			},
			{
				path: '/meeting_room',
				name: 'MeetingRoom',
				component: MeetingRoom,
				meta: {
					title: '会議室',
					isTab: true
				}
			},
			{
				path: '/offline_meeting',
				name: 'OfflineMeeting',
				component: OfflineMeeting,
				meta: {
					title: 'オフライン会議',
					isTab: true
				}
			},
			{
				path: '/online_meeting',
				name: 'OnlineMeeting',
				component: OnlineMeeting,
				meta: {
					title: 'オンライン会議',
					isTab: true
				}
			},
			{
				path: '/meeting_video/:meetingId/:uuid',
				name: 'MeetingVideo',
				component: MeetingVideo,
				meta: {
					title: 'ビデオ会議',
					isTab: true
				}
			}, {
				path: '/approval',
				name: 'Approval',
				component: Approval,
				meta: {
					title: 'オンライン承認',
					isTab: true
				}
			},
			{
				path: '/leave',
				name: 'Leave',
				component: Leave,
				meta: {
					title: '休暇管理',
					isTab: true
				}
			},
			{
				path: '/reim',
				name: 'Reim',
				component: Reim,
				meta: {
					title: '精算管理',
					isTab: true
				}
			}
		]
	},
	{
		path: "/404",
		name: "NotFound",
		component: NotFound
	},
	{
		path: '/:pathMatch(.*)*',
		redirect: "/404"
	}
]

const router = createRouter({
	history: createWebHashHistory(),
	routes
})
router.beforeEach((to, from, next) => {
	if (to.name != "Login") {
		let permissions = localStorage.getItem("permissions")
		let token = localStorage.getItem("token")
		if (permissions == null || permissions == ""||token == null || token == "") {
			next({
				name: 'Login'
			})
		}
	}
	return next()
})

export default router
