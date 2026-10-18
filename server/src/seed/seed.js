import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.model.js';
import Post from '../models/Post.model.js';
import Comment from '../models/Comment.model.js';
import Like from '../models/Like.model.js';
import Follow from '../models/Follow.model.js';
import Notification from '../models/Notification.model.js';
import Conversation from '../models/Conversation.model.js';
import Message from '../models/Message.model.js';

dotenv.config();

export const seedData = async (isStandalone = true) => {
  try {
    if (isStandalone) {
      await connectDB();
    }
    console.log('Seeding Orbit Database...');

    // Clean existing data
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({}),
      Like.deleteMany({}),
      Follow.deleteMany({}),
      Notification.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({})
    ]);

    console.log('Cleared existing collections.');

    // 1. Create Users
    const usersData = [
      {
        name: 'Alex Rivera',
        username: 'alexrivera',
        email: 'demo@orbit.com',
        password: 'Demo@1234',
        bio: 'Product designer & full-stack architect. Exploring clean UI, distributed systems, and coffee culture ☕️✨',
        location: 'San Francisco, CA',
        website: 'https://orbit.app',
        avatar: {
          url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          publicId: ''
        },
        coverPhoto: {
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          publicId: ''
        }
      },
      {
        name: 'Elena Rostova',
        username: 'elenarostova',
        email: 'elena@orbit.com',
        password: 'Demo@1234',
        bio: 'Frontend enthusiast & digital nomad. Currently crafting micro-interactions in React 🎨💻',
        location: 'Berlin, Germany',
        website: 'https://elena.design',
        avatar: {
          url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          publicId: ''
        },
        coverPhoto: {
          url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
          publicId: ''
        }
      },
      {
        name: 'Marcus Vance',
        username: 'marcusvance',
        email: 'marcus@orbit.com',
        password: 'Demo@1234',
        bio: 'Open source contributor | Distributed systems engineer | Marathon runner 🏃‍♂️⚡️',
        location: 'Austin, TX',
        website: 'https://github.com',
        avatar: {
          url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
          publicId: ''
        },
        coverPhoto: {
          url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
          publicId: ''
        }
      },
      {
        name: 'Sophia Chen',
        username: 'sophiachen',
        email: 'sophia@orbit.com',
        password: 'Demo@1234',
        bio: 'AI researcher & generative graphics enthusiast. Living at the crossroads of code and aesthetics.',
        location: 'Seattle, WA',
        website: 'https://sophia.ai',
        avatar: {
          url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
          publicId: ''
        },
        coverPhoto: {
          url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
          publicId: ''
        }
      },
      {
        name: 'Liam O’Connor',
        username: 'liamoconnor',
        email: 'liam@orbit.com',
        password: 'Demo@1234',
        bio: 'Building indie startups and SaaS apps. Sharing the unfiltered building in public journey 🚀',
        location: 'Dublin, Ireland',
        website: 'https://liam.io',
        avatar: {
          url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
          publicId: ''
        },
        coverPhoto: {
          url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
          publicId: ''
        }
      }
    ];

    const createdUsers = [];
    for (const u of usersData) {
      const user = await User.create(u);
      createdUsers.push(user);
    }

    const [demoUser, elena, marcus, sophia, liam] = createdUsers;

    console.log(`Created ${createdUsers.length} users including demo account: demo@orbit.com`);

    // 2. Setup Follow Relationships
    // Demo follows Elena, Marcus, Sophia
    await Follow.create({ follower: demoUser._id, following: elena._id });
    await Follow.create({ follower: demoUser._id, following: marcus._id });
    await Follow.create({ follower: demoUser._id, following: sophia._id });

    // Elena and Marcus follow Demo
    await Follow.create({ follower: elena._id, following: demoUser._id });
    await Follow.create({ follower: marcus._id, following: demoUser._id });
    await Follow.create({ follower: sophia._id, following: demoUser._id });
    await Follow.create({ follower: liam._id, following: elena._id });

    // Update counts
    await User.findByIdAndUpdate(demoUser._id, { followingCount: 3, followersCount: 3 });
    await User.findByIdAndUpdate(elena._id, { followingCount: 1, followersCount: 2 });
    await User.findByIdAndUpdate(marcus._id, { followingCount: 1, followersCount: 1 });
    await User.findByIdAndUpdate(sophia._id, { followingCount: 1, followersCount: 1 });
    await User.findByIdAndUpdate(liam._id, { followingCount: 1, followersCount: 0 });

    // 3. Create Posts
    const postsData = [
      {
        author: demoUser._id,
        content: 'Welcome to Orbit! 🪐 We built this platform with speed, real-time interactivity, and a friendly orange aesthetic in mind. Excited to see everyone share their thoughts here!',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80',
            publicId: ''
          }
        ],
        likesCount: 3,
        commentsCount: 2
      },
      {
        author: elena._id,
        content: 'Morning desk setup! Crisp coffee, warm ambient lighting, and pure flow state while tuning these CSS animations. What does your current workspace look like? ☕️💻',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80',
            publicId: ''
          },
          {
            url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80',
            publicId: ''
          }
        ],
        likesCount: 5,
        commentsCount: 1
      },
      {
        author: marcus._id,
        content: 'Just deployed our microservices cluster with zero downtime! 🚀 Proper health checks and cursor pagination make high-load database reads an absolute breeze.',
        images: [],
        likesCount: 4,
        commentsCount: 1
      },
      {
        author: sophia._id,
        content: 'Sunset hike in the Pacific Northwest after an intense week of neural network experiments. Always take time to recharge in nature 🌲🌅',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
            publicId: ''
          },
          {
            url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
            publicId: ''
          },
          {
            url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1000&q=80',
            publicId: ''
          }
        ],
        likesCount: 7,
        commentsCount: 0
      },
      {
        author: liam._id,
        content: 'Building products in public is scary at first, but the community feedback loop is worth 10x the effort. Keep shipping! 🛠️💪',
        images: [],
        likesCount: 2,
        commentsCount: 0
      }
    ];

    const createdPosts = [];
    for (const p of postsData) {
      const post = await Post.create(p);
      createdPosts.push(post);
      await User.findByIdAndUpdate(p.author, { $inc: { postsCount: 1 } });
    }

    console.log(`Created ${createdPosts.length} posts.`);

    // 4. Create Likes on Posts
    const firstPost = createdPosts[0];
    await Like.create({ user: elena._id, post: firstPost._id, targetType: 'Post' });
    await Like.create({ user: marcus._id, post: firstPost._id, targetType: 'Post' });
    await Like.create({ user: sophia._id, post: firstPost._id, targetType: 'Post' });

    await Like.create({ user: demoUser._id, post: createdPosts[1]._id, targetType: 'Post' });
    await Like.create({ user: demoUser._id, post: createdPosts[2]._id, targetType: 'Post' });

    // 5. Create Comments and Nested Replies
    const comment1 = await Comment.create({
      post: firstPost._id,
      author: elena._id,
      content: 'This feels incredibly responsive! Love the warm orange accents and snappy animations.',
      likesCount: 2,
      repliesCount: 1
    });

    // Nested reply to comment1
    await Comment.create({
      post: firstPost._id,
      author: demoUser._id,
      content: 'Thanks Elena! We put extra care into making the micro-interactions feel tactile.',
      parentComment: comment1._id,
      likesCount: 1
    });

    // Another top-level comment
    await Comment.create({
      post: firstPost._id,
      author: marcus._id,
      content: 'Socket.io real-time notifications are working like a charm 👌',
      likesCount: 1,
      repliesCount: 0
    });

    // Comment on Elena's post
    await Comment.create({
      post: createdPosts[1]._id,
      author: demoUser._id,
      content: 'That setup is goals! What mechanical keyboard is that?',
      likesCount: 1,
      repliesCount: 0
    });

    // 6. Create Notifications for Demo User
    await Notification.create({
      recipient: demoUser._id,
      sender: elena._id,
      type: 'like',
      post: firstPost._id,
      read: false
    });

    await Notification.create({
      recipient: demoUser._id,
      sender: elena._id,
      type: 'comment',
      post: firstPost._id,
      comment: comment1._id,
      read: false
    });

    await Notification.create({
      recipient: demoUser._id,
      sender: marcus._id,
      type: 'follow',
      read: true
    });

    // 7. Create a Sample Conversation & Direct Messages between Elena and Demo User
    const conv = await Conversation.create({
      participants: [demoUser._id, elena._id],
      unreadCounts: {
        [demoUser._id.toString()]: 1,
        [elena._id.toString()]: 0
      }
    });

    const msg1 = await Message.create({
      conversation: conv._id,
      sender: demoUser._id,
      text: 'Hey Elena! Welcome to Orbit. How is the design system looking on your end?',
      seenBy: [demoUser._id, elena._id]
    });

    const msg2 = await Message.create({
      conversation: conv._id,
      sender: elena._id,
      text: 'Hey Alex! It is looking fantastic. The warm orange palette really gives it a fresh, friendly identity.',
      seenBy: [demoUser._id, elena._id]
    });

    const msg3 = await Message.create({
      conversation: conv._id,
      sender: elena._id,
      text: 'I just shared a preview photo on the feed, check it out when you have a minute!',
      seenBy: [elena._id]
    });

    conv.lastMessage = msg3._id;
    await conv.save();

    console.log('🎉 Orbit Database seeded successfully with demo data!');
    console.log('Demo Credentials: demo@orbit.com / Demo@1234');
    if (isStandalone) {
      await closeDB();
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    if (isStandalone) {
      process.exit(1);
    }
  }
};

if (process.argv[1]?.replace(/\\/g, '/').endsWith('seed.js')) {
  seedData(true);
}
