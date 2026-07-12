import type { Translations } from '../types';

export const vi: Translations = {
  common: {
    home: 'Trang chủ',
    characters: 'Nhân vật',
    updates: 'Cập nhật',
    mastery: 'Tinh Thông',
    coreLab: 'Core Lab',
    calculators: 'Công cụ tính',
    search: 'Tìm kiếm',
    filter: 'Bộ lọc',
    all: 'Tất cả',
    viewDetails: 'Xem chi tiết',
    viewCharacter: 'Xem nhân vật',
    back: 'Quay lại',
    backToHome: 'Về trang chủ',
    backToCharacters: 'Quay lại danh sách nhân vật',
    backToUpdates: 'Quay lại Cập nhật',
    explore: 'Khám phá',
    comingSoon: 'Sắp ra mắt',
    resetFilters: 'Xóa bộ lọc',
    clearSearch: 'Xóa tìm kiếm',
    language: 'Ngôn ngữ',
    openMenu: 'Mở menu',
    closeMenu: 'Đóng menu',
    mainNavigation: 'Điều hướng chính',
    backToTop: 'Lên đầu trang',
    loading: 'Đang tải…',
    errorTitle: 'Đã có lỗi xảy ra',
    errorDescription: 'Không thể tải dữ liệu. Vui lòng tải lại trang.',
  },
  home: {
    hero: {
      eyebrow: 'Wiki & Công cụ nhân vật',
      headline: 'Chinh phục One Punch Man, tính toán chính xác từng bước.',
      exploreCharacters: 'Khám phá nhân vật',
      viewUpdates: 'Xem cập nhật',
      upcomingLabel: 'Sắp ra mắt tại CN & SEA',
      stats: {
        characters: 'Nhân vật',
        upcoming: 'Lượt ra mắt sắp tới',
        rarityTiers: 'Bậc hiếm',
      },
    },
    tagline:
      'Dữ liệu nhân vật, lịch ra mắt và công cụ tính toán dành cho người chơi One Punch Man — duyệt nhanh, so sánh dễ dàng.',
    features: {
      specCalculator: {
        title: 'Công cụ tính Spec ATK/DEF',
        description:
          'Nhập chỉ số hiện tại và thông số nâng cấp để xem chính xác Spec ATK và DEF sau khi nâng cấp.',
      },
      coreLabCalculator: {
        title: 'Công cụ tính Core-Lab',
        description:
          'Nhập cấp hiện tại và cấp mục tiêu để xem đầy đủ tài nguyên cần chuẩn bị cho Core-Lab.',
      },
    },
  },
  characters: {
    title: 'Kho dữ liệu nhân vật',
    description: 'Duyệt, tìm kiếm và lọc toàn bộ nhân vật trong game để lên kế hoạch đội hình tiếp theo.',
    searchPlaceholder: 'Tìm kiếm nhân vật…',
    filters: {
      tier: 'Bậc',
      type: 'Hệ',
      faction: 'Phe phái',
      role: 'Vai trò',
      rank: 'Cấp',
    },
    resultCount: '{count} trong {total} nhân vật',
    emptyTitle: 'Không tìm thấy nhân vật',
    emptyDescription: 'Hãy thử từ khóa khác hoặc xóa bộ lọc để xem thêm nhân vật.',
    faction: {
      hero: 'Anh Hùng',
      monster: 'Quái Nhân',
      thirdParty: 'Bên Thứ 3',
    },
    rank: {
      s1: 'S-1',
      s2: 'S-2',
      a: 'Cấp A',
      demon: 'Cấp Quỷ',
      dragon: 'Cấp Rồng',
    },
  },
  characterDetail: {
    power: 'Cấp sức mạnh',
    skills: 'Kỹ năng',
    passive: 'Nội tại',
    awakening: 'Thức tỉnh',
    awakeningTier: 'Thức Tỉnh {tier}',
    core: 'Lõi',
    coreTier: 'Lõi {tier}',
    tierBase: 'Cơ Bản',
    tierUltimateUpgrade: 'Nâng Cấp 3★',
    tierPassiveGold: '5★ Vàng',
    tierPassivePurple: '5★ Tím',
    cost: 'Chi phí: {value}',
    skillType: {
      attack: 'Tấn Công',
      ultimate: 'Tuyệt Kỹ',
      passive: 'Nội Tại',
      awakenPassive: 'Nội Tại Thức Tỉnh',
      core: 'Lõi',
    },
    glossary: 'Chú Giải Hiệu Ứng',
    strengths: 'Điểm mạnh',
    weaknesses: 'Điểm yếu',
    requirement: 'Yêu cầu: {value}',
    gallery: 'Hình ảnh',
    previousImage: 'Ảnh trước',
    nextImage: 'Ảnh tiếp theo',
  },
  releaseSchedule: {
    chinaServer: 'Máy chủ Trung Quốc',
    seaServer: 'Máy chủ SEA',
    globalServer: 'Máy chủ Toàn cầu',
    releaseType: {
      debut: 'Ra mắt',
      comeback: 'Trở lại',
      limited: 'Giới hạn',
      core: 'Core',
      event: 'Sự kiện',
    },
    timing: {
      startOfMonth: 'Đầu tháng',
      midMonth: 'Giữa tháng',
      endOfMonth: 'Cuối tháng',
    },
    status: {
      released: 'Đã ra mắt',
      upcoming: 'Sắp ra mắt',
      tbd: 'Chưa xác định',
    },
    months: {
      january: 'Tháng 1',
      february: 'Tháng 2',
      march: 'Tháng 3',
      april: 'Tháng 4',
      may: 'Tháng 5',
      june: 'Tháng 6',
      july: 'Tháng 7',
      august: 'Tháng 8',
      september: 'Tháng 9',
      october: 'Tháng 10',
      november: 'Tháng 11',
      december: 'Tháng 12',
    },
  },
  updates: {
    title: 'Cập nhật trò chơi',
    description: 'Nguồn tin mới nhất về bản vá, sự kiện và động thái từ máy chủ CN — gom hết vào một nơi.',
    showMore: 'Hiển thị thêm',
    eventSchedule: 'Lịch trình sự kiện',
    emptyTitle: 'Chưa có cập nhật nào',
    emptyDescription: 'Quay lại sau để xem tin tức bản vá, sự kiện và máy chủ.',
    category: {
      update: 'Cập nhật',
      event: 'Sự kiện',
      cnNews: 'Tin CN',
      maintenance: 'Bảo trì',
    },
  },
  mastery: {
    eyebrow: 'Hướng dẫn & Công cụ tính',
    title: 'Tinh Thông',
    description:
      'Bảng chi tiết về chỉ số Tinh Thông cùng công cụ tính Spec ATK/DEF đang được phát triển. Đây là những gì sắp ra mắt.',
    formulaGuide: 'Hướng dẫn công thức',
    sections: {
      statGrowth: {
        title: 'Tăng trưởng chỉ số',
        description: 'Mỗi cấp Tinh Thông cộng thêm bao nhiêu Spec ATK và DEF.',
      },
      upgradeMaterials: {
        title: 'Nguyên liệu nâng cấp',
        description: 'Mỗi cấp cần nguyên liệu gì và có thể farm ở đâu.',
      },
      optimizationTips: {
        title: 'Mẹo tối ưu',
        description: 'Thứ tự đầu tư điểm Tinh Thông hiệu quả nhất.',
      },
    },
    calculatorTitle: 'Công cụ tính',
    calculatorPreview:
      'Công cụ tính Spec ATK/DEF sẽ được tích hợp tại đây. Trong lúc chờ, hãy dùng công cụ độc lập.',
    calculatorLink: 'Đến công cụ tính Spec ATK/DEF →',
  },
  coreLab: {
    eyebrow: 'Hướng dẫn & Bảng điều khiển',
    title: 'Core-Lab',
    description:
      'Lựa chọn core, hiệu ứng từng cấp và công cụ tính tài nguyên đang được phát triển. Đây là những gì sắp ra mắt.',
    guideTitle: 'Hướng dẫn Core-Lab',
    sections: {
      coreSelection: {
        title: 'Chọn Core',
        description: 'Core nào đáng đầu tư và vì sao.',
      },
      unlockedBuffs: {
        title: 'Hiệu ứng mở khóa',
        description: 'Mỗi cấp Core-Lab mở khóa hiệu ứng gì khi nâng cấp.',
      },
      resourcePlanning: {
        title: 'Lên kế hoạch tài nguyên',
        description: 'Cách phân bổ nguyên liệu hợp lý cho nhiều core.',
      },
    },
    calculatorTitle: 'Công cụ tính cấp độ',
    calculatorPreview:
      'Công cụ tính tài nguyên Core-Lab sẽ được tích hợp tại đây. Trong lúc chờ, hãy dùng công cụ độc lập.',
    calculatorLink: 'Đến công cụ tính Core-Lab →',
  },
  calculators: {
    eyebrow: 'Công cụ',
    title: 'Công cụ tính',
    description: 'Tính toán kỹ trước khi tiêu tốn tài nguyên — chọn một công cụ bên dưới.',
  },
  comingSoonPages: {
    specCalculator: {
      title: 'Công cụ tính Spec ATK/DEF',
      description:
        'Nhập chỉ số hiện tại và thông số nâng cấp để xem kết quả Spec ATK/DEF. Công cụ này sẽ sớm có mặt.',
    },
    coreLabCalculator: {
      title: 'Công cụ tính tài nguyên Core-Lab',
      description:
        'Nhập cấp hiện tại và cấp mục tiêu để xem tổng tài nguyên cần, chia theo từng loại. Sắp ra mắt.',
    },
  },
  notFound: {
    title: 'Trang này không tồn tại.',
    description:
      'Trang bạn tìm có thể đã bị chuyển hoặc không còn tồn tại. Quay lại trang chủ để tiếp tục khám phá.',
  },
  footer: {
    navigationLabel: 'Điều hướng chân trang',
    tagline: 'Wiki cộng đồng không chính thức và bộ công cụ tính toán dành cho người chơi One Punch Man.',
    disclaimer:
      '© {year} S-Class Codex. Đây là wiki cộng đồng không chính thức do người hâm mộ thực hiện — không liên kết hay được xác nhận bởi nhà phát hành chính thức của game One Punch Man. Mọi tên gọi, hình ảnh và tài sản trong game thuộc về chủ sở hữu tương ứng.',
    donate: {
      badge: 'Ủng hộ dự án',
      title: 'Thích trang này? Mời mình một ly cà phê ☕',
      description:
        'S-Class Codex là dự án cá nhân, phi lợi nhuận. Một chút ủng hộ sẽ giúp mình trả chi phí server và cập nhật dữ liệu nhanh hơn.',
      accountHolder: 'Chủ tài khoản',
      copy: 'Sao chép',
      copied: 'Đã sao chép!',
      qrAlt: 'Mã QR chuyển khoản MB Bank tới {holder}',
    },
    legalLabel: 'Pháp lý',
    privacyPolicyLink: 'Chính sách bảo mật',
    disclaimerLink: 'Tuyên bố & Gỡ nội dung',
  },
  legal: {
    privacy: {
      eyebrow: 'Pháp lý',
      title: 'Chính sách bảo mật',
      updated: 'Cập nhật lần cuối: 11/07/2026',
      intro:
        'S-Class Codex là một trang wiki tĩnh, phi lợi nhuận, không yêu cầu đăng ký hay đăng nhập tài khoản. Trang này giải thích những gì trình duyệt của bạn lưu trữ khi truy cập site, và những gì chúng tôi không thu thập.',
      sections: {
        dataStored: {
          title: 'Dữ liệu lưu trên trình duyệt của bạn',
          body: 'Duy nhất một mục được lưu cục bộ: lựa chọn ngôn ngữ (Tiếng Việt / English), qua localStorage, để ghi nhớ ngôn ngữ bạn chọn cho lần truy cập sau. Dữ liệu này không bao giờ được gửi lên bất kỳ server nào.',
        },
        noTracking: {
          title: 'Những gì chúng tôi không thu thập',
          body: 'Site không có hệ thống đăng ký/đăng nhập, không dùng cookie theo dõi, không tích hợp công cụ phân tích hành vi hay quảng cáo, và không thu thập bất kỳ thông tin cá nhân nào của người truy cập.',
        },
        thirdParty: {
          title: 'Nội dung tải từ bên thứ ba',
          body: 'Một vài tài nguyên được tải trực tiếp từ dịch vụ bên ngoài: font chữ Inter từ Google Fonts, và mã QR chuyển khoản ngân hàng từ VietQR (chỉ khi bạn mở khung ủng hộ dự án). Việc tải các tài nguyên này đồng nghĩa trình duyệt của bạn sẽ kết nối trực tiếp tới máy chủ của dịch vụ đó, tương tự như khi tải bất kỳ hình ảnh hay font chữ nào trên web.',
        },
        donation: {
          title: 'Thông tin ủng hộ dự án',
          body: 'Giao dịch qua MoMo hoặc chuyển khoản ngân hàng diễn ra hoàn toàn trong ứng dụng MoMo/ngân hàng của bạn. Chúng tôi không thu thập, lưu trữ hay có quyền truy cập vào bất kỳ thông tin giao dịch, số dư hay dữ liệu tài khoản nào.',
        },
        contact: {
          title: 'Liên hệ',
          body: 'Nếu bạn có câu hỏi về quyền riêng tư, vui lòng liên hệ qua kênh bên dưới.',
        },
      },
    },
    disclaimer: {
      eyebrow: 'Pháp lý',
      title: 'Tuyên bố & Gỡ nội dung',
      updated: 'Cập nhật lần cuối: 11/07/2026',
      intro:
        'S-Class Codex là dự án cá nhân, phi lợi nhuận, được thực hiện bởi một người hâm mộ One Punch Man. Trang này không thuộc sở hữu, không liên kết và không được xác nhận bởi nhà phát hành hay chủ sở hữu bản quyền chính thức của One Punch Man.',
      sections: {
        ownership: {
          title: 'Quyền sở hữu nội dung',
          body: 'Mọi tên nhân vật, hình ảnh, thiết kế, cốt truyện và tài sản liên quan đến One Punch Man thuộc quyền sở hữu của tác giả gốc và các đơn vị phát hành/nắm giữ bản quyền tương ứng. Chúng tôi sử dụng các nội dung này với mục đích phi lợi nhuận, mang tính thông tin, phục vụ cộng đồng người chơi và người hâm mộ.',
        },
        nonCommercial: {
          title: 'Không nhằm mục đích thương mại',
          body: 'S-Class Codex không bán quảng cáo và không kinh doanh dựa trên nội dung game. Khoản ủng hộ tự nguyện từ cộng đồng (nếu có) chỉ dùng để trang trải chi phí vận hành server và duy trì cập nhật dữ liệu, không nhằm mục đích sinh lời.',
        },
        takedown: {
          title: 'Yêu cầu gỡ nội dung',
          body: 'Nếu bạn là chủ sở hữu bản quyền hoặc đại diện hợp pháp và cho rằng nội dung trên trang này vi phạm quyền của bạn, vui lòng liên hệ qua kênh bên dưới kèm theo: (1) mô tả nội dung bị cho là vi phạm, (2) đường dẫn (URL) tới nội dung đó trên site, (3) thông tin liên hệ của bạn, và (4) xác nhận rằng bạn tin bằng thiện chí đây là hành vi vi phạm. Chúng tôi sẽ xem xét và gỡ bỏ nội dung liên quan trong thời gian sớm nhất có thể.',
        },
        contact: {
          title: 'Liên hệ',
          body: 'Gửi yêu cầu gỡ nội dung hoặc khiếu nại bản quyền qua kênh liên hệ bên dưới.',
        },
      },
    },
    contactChannelLabel: 'Kênh liên hệ',
  },
};
