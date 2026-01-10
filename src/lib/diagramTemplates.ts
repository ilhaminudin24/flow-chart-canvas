import { DiagramTemplate, DiagramType } from '@/types/diagram';

export const diagramTemplates: DiagramTemplate[] = [
  {
    type: 'flowchart',
    name: 'Flowchart',
    icon: '📊',
    description: 'Standard process flow diagrams',
    template: `flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E`
  },
  {
    type: 'sequence',
    name: 'Sequence',
    icon: '🔄',
    description: 'Interaction sequences between objects',
    template: `sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob!
    B-->>A: Hi Alice!
    A->>B: How are you?
    B-->>A: I'm good, thanks!`
  },
  {
    type: 'class',
    name: 'Class',
    icon: '🏗️',
    description: 'UML class diagrams',
    template: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    class Cat {
        +String color
        +meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat`
  },
  {
    type: 'state',
    name: 'State',
    icon: '🔵',
    description: 'State machine diagrams',
    template: `stateDiagram-v2
    [*] --> Idle
    Idle --> Running: Start
    Running --> Paused: Pause
    Paused --> Running: Resume
    Running --> Idle: Stop
    Paused --> Idle: Stop`
  },
  {
    type: 'er',
    name: 'ER Diagram',
    icon: '🗃️',
    description: 'Entity relationship diagrams',
    template: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER {
        string name
        string email
    }
    ORDER {
        int orderNumber
        date createdAt
    }
    LINE-ITEM {
        string product
        int quantity
    }`
  },
  {
    type: 'gantt',
    name: 'Gantt',
    icon: '📅',
    description: 'Project timeline charts',
    template: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Planning
    Research       :a1, 2024-01-01, 7d
    Design         :a2, after a1, 5d
    section Development
    Backend        :a3, after a2, 10d
    Frontend       :a4, after a2, 12d
    section Launch
    Testing        :a5, after a4, 5d
    Deploy         :a6, after a5, 2d`
  },
  {
    type: 'pie',
    name: 'Pie Chart',
    icon: '🥧',
    description: 'Simple pie charts',
    template: `pie title Market Share
    "Product A" : 45
    "Product B" : 30
    "Product C" : 15
    "Others" : 10`
  },
  {
    type: 'mindmap',
    name: 'Mind Map',
    icon: '🧠',
    description: 'Hierarchical mind maps',
    template: `mindmap
  root((Project))
    Planning
      Research
      Requirements
    Development
      Frontend
      Backend
    Testing
      Unit Tests
      Integration`
  },
  {
    type: 'timeline',
    name: 'Timeline',
    icon: '📆',
    description: 'Chronological timelines',
    template: `timeline
    title History of Events
    2020 : Project Started
    2021 : First Release
         : Team Expanded
    2022 : Major Update
    2023 : Global Launch`
  },
  {
    type: 'quadrant',
    name: 'Quadrant',
    icon: '📐',
    description: 'Quadrant analysis charts',
    template: `quadrantChart
    title Priority Matrix
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact
    quadrant-1 Quick Wins
    quadrant-2 Major Projects
    quadrant-3 Fill Ins
    quadrant-4 Thankless Tasks
    Feature A: [0.3, 0.8]
    Feature B: [0.7, 0.9]
    Feature C: [0.2, 0.3]
    Feature D: [0.8, 0.2]`
  },
  {
    type: 'gitgraph',
    name: 'Git Graph',
    icon: '🌿',
    description: 'Git branch diagrams',
    template: `gitGraph
    commit id: "Initial"
    branch develop
    commit id: "Feature 1"
    commit id: "Feature 2"
    checkout main
    merge develop
    commit id: "Hotfix"
    branch release
    commit id: "v1.0"`
  },
  {
    type: 'journey',
    name: 'User Journey',
    icon: '🛤️',
    description: 'User experience journeys',
    template: `journey
    title User Onboarding Journey
    section Sign Up
      Visit website: 5: User
      Create account: 3: User
      Verify email: 4: User
    section First Use
      Complete tutorial: 4: User
      Create first project: 5: User
    section Engagement
      Invite team members: 3: User
      Upgrade to pro: 5: User`
  },
  {
    type: 'c4',
    name: 'C4 Context',
    icon: '🏢',
    description: 'C4 architecture diagrams',
    template: `C4Context
    title System Context Diagram
    Person(user, "User", "A user of the system")
    System(system, "Application", "The main application")
    System_Ext(email, "Email System", "Sends emails")
    Rel(user, system, "Uses")
    Rel(system, email, "Sends emails using")`
  },
  {
    type: 'sankey',
    name: 'Sankey',
    icon: '〰️',
    description: 'Flow quantity diagrams',
    template: `sankey-beta
    Source A,Target X,50
    Source A,Target Y,30
    Source B,Target Y,40
    Source B,Target Z,60
    Target X,Final,50
    Target Y,Final,70
    Target Z,Final,60`
  },
  {
    type: 'block',
    name: 'Block',
    icon: '🧱',
    description: 'Block diagrams',
    template: `block-beta
    columns 3
    a["Frontend"]:1
    b["API Gateway"]:1
    c["Backend"]:1
    d["Database"]:3`
  }
];

export const getTemplateByType = (type: DiagramType): DiagramTemplate | undefined => {
  return diagramTemplates.find(t => t.type === type);
};

export const getDefaultCode = (type: DiagramType): string => {
  const template = getTemplateByType(type);
  return template?.template || diagramTemplates[0].template;
};
